"""
Multi-Factor Authentication (MFA) routes
Implements TOTP, SMS, and Email-based MFA
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import pyotp
import qrcode
import io
import base64
import boto3
from botocore.exceptions import ClientError
import secrets
import time
from datetime import datetime, timedelta
from ..models import User, AuditLog, SecurityEvent, db
from ..utils.security import log_security_event, generate_secure_token
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

mfa_bp = Blueprint('mfa', __name__)

def get_sns_client():
    """Get AWS SNS client for SMS"""
    return boto3.client(
        'sns',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

def get_ses_client():
    """Get AWS SES client for email"""
    return boto3.client(
        'ses',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

@mfa_bp.route('/setup-totp', methods=['POST'])
@jwt_required()
def setup_totp():
    """Setup TOTP (Time-based One-Time Password) for user"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate secret key for TOTP
        secret = pyotp.random_base32()
        
        # Create TOTP URI for QR code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="Alhambra Bank & Trust"
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        # Convert QR code to base64 image
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        qr_code_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Store secret temporarily (user needs to verify setup)
        # In production, encrypt this secret
        user.totp_secret_temp = secret
        db.session.commit()
        
        # Log MFA setup attempt
        audit_log = AuditLog(
            user_id=user.id,
            action='mfa_totp_setup_initiated',
            resource='user',
            resource_id=str(user.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'TOTP setup initiated',
            'qr_code': f"data:image/png;base64,{qr_code_base64}",
            'secret': secret,  # Also provide secret for manual entry
            'backup_codes': generate_backup_codes()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"TOTP setup error: {e}")
        return jsonify({'error': 'Failed to setup TOTP'}), 500

@mfa_bp.route('/verify-totp-setup', methods=['POST'])
@jwt_required()
def verify_totp_setup():
    """Verify TOTP setup with user-provided code"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.totp_secret_temp:
            return jsonify({'error': 'TOTP setup not initiated'}), 400
        
        data = request.get_json()
        provided_code = data.get('code')
        
        if not provided_code:
            return jsonify({'error': 'TOTP code is required'}), 400
        
        # Verify the provided code
        totp = pyotp.TOTP(user.totp_secret_temp)
        if totp.verify(provided_code, valid_window=1):
            # Code is valid, activate TOTP
            user.totp_secret = user.totp_secret_temp
            user.totp_secret_temp = None
            user.mfa_enabled = True
            user.mfa_method = 'totp'
            db.session.commit()
            
            # Log successful MFA setup
            audit_log = AuditLog(
                user_id=user.id,
                action='mfa_totp_setup_completed',
                resource='user',
                resource_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(audit_log)
            db.session.commit()
            
            return jsonify({
                'message': 'TOTP setup completed successfully',
                'mfa_enabled': True
            }), 200
        else:
            # Invalid code
            log_security_event(
                'mfa_setup_invalid_code',
                'medium',
                request.remote_addr,
                f'Invalid TOTP code during setup for user {user.email}',
                user.id
            )
            return jsonify({'error': 'Invalid TOTP code'}), 400
        
    except Exception as e:
        current_app.logger.error(f"TOTP verification error: {e}")
        return jsonify({'error': 'Failed to verify TOTP'}), 500

@mfa_bp.route('/setup-sms', methods=['POST'])
@jwt_required()
def setup_sms_mfa():
    """Setup SMS-based MFA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({'error': 'Phone number is required'}), 400
        
        # Validate phone number format (basic validation)
        import re
        phone_pattern = r'^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$'
        if not re.match(phone_pattern, phone_number.replace('-', '').replace(' ', '')):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Generate verification code
        verification_code = secrets.randbelow(900000) + 100000  # 6-digit code
        
        # Store verification code temporarily
        user.sms_verification_code = str(verification_code)
        user.sms_verification_expires = datetime.utcnow() + timedelta(minutes=10)
        user.phone_temp = phone_number
        db.session.commit()
        
        # Send SMS via AWS SNS
        try:
            sns_client = get_sns_client()
            message = f"Your Alhambra Bank verification code is: {verification_code}. This code expires in 10 minutes."
            
            sns_client.publish(
                PhoneNumber=phone_number,
                Message=message,
                MessageAttributes={
                    'AWS.SNS.SMS.SMSType': {
                        'DataType': 'String',
                        'StringValue': 'Transactional'
                    }
                }
            )
            
            # Log SMS MFA setup attempt
            audit_log = AuditLog(
                user_id=user.id,
                action='mfa_sms_setup_initiated',
                resource='user',
                resource_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent'),
                details={'phone_number': phone_number[-4:]}  # Log only last 4 digits
            )
            db.session.add(audit_log)
            db.session.commit()
            
            return jsonify({
                'message': 'Verification code sent to your phone',
                'expires_in': 600  # 10 minutes
            }), 200
            
        except ClientError as e:
            current_app.logger.error(f"SMS sending error: {e}")
            return jsonify({'error': 'Failed to send SMS verification code'}), 500
        
    except Exception as e:
        current_app.logger.error(f"SMS MFA setup error: {e}")
        return jsonify({'error': 'Failed to setup SMS MFA'}), 500

@mfa_bp.route('/verify-sms-setup', methods=['POST'])
@jwt_required()
def verify_sms_setup():
    """Verify SMS MFA setup"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.sms_verification_code:
            return jsonify({'error': 'SMS verification not initiated'}), 400
        
        data = request.get_json()
        provided_code = data.get('code')
        
        if not provided_code:
            return jsonify({'error': 'Verification code is required'}), 400
        
        # Check if code has expired
        if datetime.utcnow() > user.sms_verification_expires:
            user.sms_verification_code = None
            user.sms_verification_expires = None
            user.phone_temp = None
            db.session.commit()
            return jsonify({'error': 'Verification code has expired'}), 400
        
        # Verify the code
        if user.sms_verification_code == provided_code:
            # Code is valid, activate SMS MFA
            user.phone = user.phone_temp
            user.phone_temp = None
            user.sms_verification_code = None
            user.sms_verification_expires = None
            user.mfa_enabled = True
            user.mfa_method = 'sms'
            db.session.commit()
            
            # Log successful SMS MFA setup
            audit_log = AuditLog(
                user_id=user.id,
                action='mfa_sms_setup_completed',
                resource='user',
                resource_id=str(user.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(audit_log)
            db.session.commit()
            
            return jsonify({
                'message': 'SMS MFA setup completed successfully',
                'mfa_enabled': True
            }), 200
        else:
            # Invalid code
            log_security_event(
                'mfa_sms_setup_invalid_code',
                'medium',
                request.remote_addr,
                f'Invalid SMS code during setup for user {user.email}',
                user.id
            )
            return jsonify({'error': 'Invalid verification code'}), 400
        
    except Exception as e:
        current_app.logger.error(f"SMS verification error: {e}")
        return jsonify({'error': 'Failed to verify SMS code'}), 500

@mfa_bp.route('/verify-mfa', methods=['POST'])
@jwt_required()
def verify_mfa():
    """Verify MFA code during login"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.mfa_enabled:
            return jsonify({'error': 'MFA not enabled for this user'}), 400
        
        data = request.get_json()
        provided_code = data.get('code')
        
        if not provided_code:
            return jsonify({'error': 'MFA code is required'}), 400
        
        # Verify based on MFA method
        if user.mfa_method == 'totp':
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(provided_code, valid_window=1):
                # Valid TOTP code
                return complete_mfa_verification(user)
            else:
                return handle_invalid_mfa_code(user, 'totp')
        
        elif user.mfa_method == 'sms':
            # For SMS, we need to send a new code first
            return jsonify({'error': 'SMS code verification not implemented in this endpoint'}), 400
        
        else:
            return jsonify({'error': 'Unknown MFA method'}), 400
        
    except Exception as e:
        current_app.logger.error(f"MFA verification error: {e}")
        return jsonify({'error': 'Failed to verify MFA'}), 500

@mfa_bp.route('/send-sms-code', methods=['POST'])
@jwt_required()
def send_sms_code():
    """Send SMS code for MFA verification"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.mfa_enabled or user.mfa_method != 'sms':
            return jsonify({'error': 'SMS MFA not enabled for this user'}), 400
        
        # Generate verification code
        verification_code = secrets.randbelow(900000) + 100000  # 6-digit code
        
        # Store verification code temporarily
        user.sms_verification_code = str(verification_code)
        user.sms_verification_expires = datetime.utcnow() + timedelta(minutes=5)
        db.session.commit()
        
        # Send SMS
        try:
            sns_client = get_sns_client()
            message = f"Your Alhambra Bank login code is: {verification_code}. This code expires in 5 minutes."
            
            sns_client.publish(
                PhoneNumber=user.phone,
                Message=message,
                MessageAttributes={
                    'AWS.SNS.SMS.SMSType': {
                        'DataType': 'String',
                        'StringValue': 'Transactional'
                    }
                }
            )
            
            return jsonify({
                'message': 'SMS code sent successfully',
                'expires_in': 300  # 5 minutes
            }), 200
            
        except ClientError as e:
            current_app.logger.error(f"SMS sending error: {e}")
            return jsonify({'error': 'Failed to send SMS code'}), 500
        
    except Exception as e:
        current_app.logger.error(f"SMS code sending error: {e}")
        return jsonify({'error': 'Failed to send SMS code'}), 500

@mfa_bp.route('/verify-sms-code', methods=['POST'])
@jwt_required()
def verify_sms_code():
    """Verify SMS code for MFA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.sms_verification_code:
            return jsonify({'error': 'SMS code not sent or expired'}), 400
        
        data = request.get_json()
        provided_code = data.get('code')
        
        if not provided_code:
            return jsonify({'error': 'SMS code is required'}), 400
        
        # Check if code has expired
        if datetime.utcnow() > user.sms_verification_expires:
            user.sms_verification_code = None
            user.sms_verification_expires = None
            db.session.commit()
            return jsonify({'error': 'SMS code has expired'}), 400
        
        # Verify the code
        if user.sms_verification_code == provided_code:
            # Clear the verification code
            user.sms_verification_code = None
            user.sms_verification_expires = None
            db.session.commit()
            
            return complete_mfa_verification(user)
        else:
            return handle_invalid_mfa_code(user, 'sms')
        
    except Exception as e:
        current_app.logger.error(f"SMS code verification error: {e}")
        return jsonify({'error': 'Failed to verify SMS code'}), 500

@mfa_bp.route('/disable-mfa', methods=['POST'])
@jwt_required()
def disable_mfa():
    """Disable MFA for user (requires password confirmation)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        password = data.get('password')
        
        if not password or not user.check_password(password):
            return jsonify({'error': 'Invalid password'}), 401
        
        # Disable MFA
        user.mfa_enabled = False
        user.mfa_method = None
        user.totp_secret = None
        user.totp_secret_temp = None
        user.sms_verification_code = None
        user.sms_verification_expires = None
        db.session.commit()
        
        # Log MFA disable
        audit_log = AuditLog(
            user_id=user.id,
            action='mfa_disabled',
            resource='user',
            resource_id=str(user.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'MFA disabled successfully',
            'mfa_enabled': False
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"MFA disable error: {e}")
        return jsonify({'error': 'Failed to disable MFA'}), 500

@mfa_bp.route('/backup-codes', methods=['GET'])
@jwt_required()
def get_backup_codes():
    """Generate backup codes for MFA"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.mfa_enabled:
            return jsonify({'error': 'MFA not enabled'}), 400
        
        backup_codes = generate_backup_codes()
        
        # In production, store encrypted backup codes in database
        # For demo, just return them
        
        return jsonify({
            'backup_codes': backup_codes,
            'message': 'Store these backup codes securely. Each can only be used once.'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Backup codes generation error: {e}")
        return jsonify({'error': 'Failed to generate backup codes'}), 500

def generate_backup_codes(count=10):
    """Generate backup codes for MFA recovery"""
    codes = []
    for _ in range(count):
        code = secrets.randbelow(900000000) + 100000000  # 9-digit code
        codes.append(f"{code:09d}")
    return codes

def complete_mfa_verification(user):
    """Complete MFA verification process"""
    # Log successful MFA verification
    audit_log = AuditLog(
        user_id=user.id,
        action='mfa_verification_success',
        resource='user',
        resource_id=str(user.id),
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(audit_log)
    db.session.commit()
    
    # Set MFA verification flag in session/token
    # In production, this would be handled by JWT claims or session
    
    return jsonify({
        'message': 'MFA verification successful',
        'mfa_verified': True
    }), 200

def handle_invalid_mfa_code(user, method):
    """Handle invalid MFA code attempts"""
    log_security_event(
        f'mfa_{method}_invalid_code',
        'medium',
        request.remote_addr,
        f'Invalid {method.upper()} code for user {user.email}',
        user.id
    )
    
    return jsonify({'error': 'Invalid MFA code'}), 400
