"""
Authentication routes with AWS Cognito integration
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import boto3
from botocore.exceptions import ClientError
import hmac
import hashlib
import base64
from ..models import User, AuditLog, SecurityEvent, db
from ..utils.security import log_security_event, validate_request_security
import re

auth_bp = Blueprint('auth', __name__)

def get_cognito_client():
    """Get AWS Cognito client"""
    return boto3.client(
        'cognito-idp',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

def calculate_secret_hash(username, client_id, client_secret):
    """Calculate secret hash for Cognito"""
    message = username + client_id
    dig = hmac.new(
        client_secret.encode('UTF-8'),
        msg=message.encode('UTF-8'),
        digestmod=hashlib.sha256
    ).digest()
    return base64.b64encode(dig).decode()

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user with AWS Cognito"""
    try:
        # Validate request security
        security_check = validate_request_security(request)
        if not security_check['valid']:
            return jsonify({'error': security_check['reason']}), 400
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'preferred_language']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        password = data['password']
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create user in AWS Cognito
        cognito_client = get_cognito_client()
        
        try:
            cognito_response = cognito_client.admin_create_user(
                UserPoolId=current_app.config['COGNITO_USER_POOL_ID'],
                Username=data['email'],
                UserAttributes=[
                    {'Name': 'email', 'Value': data['email']},
                    {'Name': 'given_name', 'Value': data['first_name']},
                    {'Name': 'family_name', 'Value': data['last_name']},
                    {'Name': 'locale', 'Value': data['preferred_language']}
                ],
                TemporaryPassword=password,
                MessageAction='SUPPRESS'
            )
            
            # Set permanent password
            cognito_client.admin_set_user_password(
                UserPoolId=current_app.config['COGNITO_USER_POOL_ID'],
                Username=data['email'],
                Password=password,
                Permanent=True
            )
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UsernameExistsException':
                return jsonify({'error': 'User already exists in Cognito'}), 409
            else:
                current_app.logger.error(f"Cognito error: {e}")
                return jsonify({'error': 'Failed to create user account'}), 500
        
        # Create user in local database
        user = User(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            preferred_language=data['preferred_language'],
            cognito_user_id=cognito_response['User']['Username']
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Log audit event
        audit_log = AuditLog(
            user_id=user.id,
            action='user_registration',
            resource='user',
            resource_id=str(user.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            details={'email': data['email'], 'language': data['preferred_language']}
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Registration error: {e}")
        log_security_event('registration_error', 'medium', request.remote_addr, str(e))
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user with AWS Cognito"""
    try:
        # Validate request security
        security_check = validate_request_security(request)
        if not security_check['valid']:
            return jsonify({'error': security_check['reason']}), 400
        
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user in local database
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            log_security_event('login_attempt_invalid_user', 'medium', request.remote_addr, data['email'])
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Authenticate with AWS Cognito
        cognito_client = get_cognito_client()
        
        try:
            auth_response = cognito_client.admin_initiate_auth(
                UserPoolId=current_app.config['COGNITO_USER_POOL_ID'],
                ClientId=current_app.config['COGNITO_CLIENT_ID'],
                AuthFlow='ADMIN_NO_SRP_AUTH',
                AuthParameters={
                    'USERNAME': data['email'],
                    'PASSWORD': data['password']
                }
            )
            
            # Create JWT tokens
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))
            
            # Log successful login
            audit_log = AuditLog(
                user_id=user.id,
                action='user_login',
                resource='user',
                resource_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(audit_log)
            db.session.commit()
            
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict(),
                'cognito_tokens': {
                    'access_token': auth_response['AuthenticationResult']['AccessToken'],
                    'id_token': auth_response['AuthenticationResult']['IdToken'],
                    'refresh_token': auth_response['AuthenticationResult']['RefreshToken']
                }
            }), 200
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code in ['NotAuthorizedException', 'UserNotFoundException']:
                log_security_event('login_failed', 'medium', request.remote_addr, data['email'])
                return jsonify({'error': 'Invalid credentials'}), 401
            elif error_code == 'UserNotConfirmedException':
                return jsonify({'error': 'User account not confirmed'}), 401
            else:
                current_app.logger.error(f"Cognito auth error: {e}")
                return jsonify({'error': 'Authentication failed'}), 500
        
    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        log_security_event('login_error', 'high', request.remote_addr, str(e))
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 404
        
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {e}")
        return jsonify({'error': 'Token refresh failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user and invalidate tokens"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user:
            # Log logout event
            audit_log = AuditLog(
                user_id=user.id,
                action='user_logout',
                resource='user',
                resource_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(audit_log)
            db.session.commit()
        
        # In a production environment, you would also:
        # 1. Add the JWT to a blacklist
        # 2. Invalidate Cognito tokens
        # 3. Clear any cached sessions
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {e}")
        return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Profile fetch error: {e}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'preferred_language' in data:
            user.preferred_language = data['preferred_language']
        
        db.session.commit()
        
        # Log profile update
        audit_log = AuditLog(
            user_id=user.id,
            action='profile_update',
            resource='user',
            resource_id=str(user.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            details=data
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Profile update error: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500
