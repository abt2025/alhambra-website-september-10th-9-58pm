"""
Video KYC routes with AWS Rekognition integration
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
from botocore.exceptions import ClientError
import uuid
import json
from datetime import datetime
from ..models import User, KYCSession, Document, AuditLog, db, KYCStatus, DocumentType
from ..utils.security import log_security_event
import cv2
import numpy as np
import base64

kyc_bp = Blueprint('kyc', __name__)

def get_rekognition_client():
    """Get AWS Rekognition client"""
    return boto3.client(
        'rekognition',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

def get_s3_client():
    """Get AWS S3 client"""
    return boto3.client(
        's3',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

@kyc_bp.route('/start-session', methods=['POST'])
@jwt_required()
def start_kyc_session():
    """Start a new video KYC session"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user already has an active KYC session
        active_session = KYCSession.query.filter_by(
            user_id=user.id,
            status=KYCStatus.IN_PROGRESS
        ).first()
        
        if active_session:
            return jsonify({
                'message': 'Active KYC session found',
                'session': active_session.to_dict()
            }), 200
        
        # Create new KYC session
        session_token = str(uuid.uuid4())
        kyc_session = KYCSession(
            user_id=user.id,
            session_token=session_token,
            status=KYCStatus.IN_PROGRESS
        )
        
        db.session.add(kyc_session)
        db.session.commit()
        
        # Log KYC session start
        audit_log = AuditLog(
            user_id=user.id,
            action='kyc_session_start',
            resource='kyc_session',
            resource_id=str(kyc_session.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'KYC session started successfully',
            'session': kyc_session.to_dict(),
            'session_token': session_token
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"KYC session start error: {e}")
        return jsonify({'error': 'Failed to start KYC session'}), 500

@kyc_bp.route('/upload-video', methods=['POST'])
@jwt_required()
def upload_kyc_video():
    """Upload and analyze KYC video"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        session_token = request.form.get('session_token')
        if not session_token:
            return jsonify({'error': 'Session token is required'}), 400
        
        # Find KYC session
        kyc_session = KYCSession.query.filter_by(
            user_id=user.id,
            session_token=session_token,
            status=KYCStatus.IN_PROGRESS
        ).first()
        
        if not kyc_session:
            return jsonify({'error': 'Invalid or expired KYC session'}), 404
        
        # Get uploaded video file
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        # Generate S3 key for video
        video_s3_key = f"kyc-videos/{user.id}/{kyc_session.id}/{uuid.uuid4()}.mp4"
        
        # Upload video to S3
        s3_client = get_s3_client()
        try:
            s3_client.upload_fileobj(
                video_file,
                current_app.config['S3_BUCKET'],
                video_s3_key,
                ExtraArgs={
                    'ContentType': 'video/mp4',
                    'ServerSideEncryption': 'AES256'
                }
            )
        except ClientError as e:
            current_app.logger.error(f"S3 upload error: {e}")
            return jsonify({'error': 'Failed to upload video'}), 500
        
        # Update KYC session with video S3 key
        kyc_session.video_s3_key = video_s3_key
        db.session.commit()
        
        # Analyze video with Rekognition (async processing)
        analyze_kyc_video_async.delay(str(kyc_session.id), video_s3_key)
        
        return jsonify({
            'message': 'Video uploaded successfully, analysis in progress',
            'session': kyc_session.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Video upload error: {e}")
        return jsonify({'error': 'Failed to upload video'}), 500

@kyc_bp.route('/capture-frame', methods=['POST'])
@jwt_required()
def capture_frame():
    """Capture and analyze a single frame for liveness detection"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        session_token = data.get('session_token')
        frame_data = data.get('frame_data')  # Base64 encoded image
        
        if not session_token or not frame_data:
            return jsonify({'error': 'Session token and frame data are required'}), 400
        
        # Find KYC session
        kyc_session = KYCSession.query.filter_by(
            user_id=user.id,
            session_token=session_token,
            status=KYCStatus.IN_PROGRESS
        ).first()
        
        if not kyc_session:
            return jsonify({'error': 'Invalid or expired KYC session'}), 404
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(frame_data.split(',')[1])
        except Exception as e:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Analyze with Rekognition
        rekognition_client = get_rekognition_client()
        
        try:
            # Face detection and analysis
            face_response = rekognition_client.detect_faces(
                Image={'Bytes': image_data},
                Attributes=['ALL']
            )
            
            # Liveness detection (face comparison with previous frames)
            liveness_response = rekognition_client.detect_faces(
                Image={'Bytes': image_data},
                Attributes=['EMOTIONS', 'EYEGLASSES', 'EYES_OPEN', 'MOUTH_OPEN']
            )
            
            analysis_result = {
                'faces_detected': len(face_response['FaceDetails']),
                'face_details': face_response['FaceDetails'],
                'liveness_indicators': liveness_response['FaceDetails'],
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Calculate basic liveness score
            liveness_score = calculate_liveness_score(analysis_result)
            
            return jsonify({
                'message': 'Frame analyzed successfully',
                'analysis': analysis_result,
                'liveness_score': liveness_score,
                'is_live': liveness_score > 0.7
            }), 200
            
        except ClientError as e:
            current_app.logger.error(f"Rekognition error: {e}")
            return jsonify({'error': 'Face analysis failed'}), 500
        
    except Exception as e:
        current_app.logger.error(f"Frame capture error: {e}")
        return jsonify({'error': 'Failed to analyze frame'}), 500

def calculate_liveness_score(analysis_result):
    """Calculate liveness score based on face analysis"""
    if not analysis_result['face_details']:
        return 0.0
    
    face = analysis_result['face_details'][0]
    score = 0.0
    
    # Check for eyes open
    if face.get('EyesOpen', {}).get('Value', False):
        score += 0.3
    
    # Check for mouth open (indicates speech/movement)
    if face.get('MouthOpen', {}).get('Value', False):
        score += 0.2
    
    # Check for emotions (indicates natural expression)
    emotions = face.get('Emotions', [])
    if emotions:
        dominant_emotion = max(emotions, key=lambda x: x['Confidence'])
        if dominant_emotion['Type'] in ['HAPPY', 'SURPRISED', 'CONFUSED']:
            score += 0.3
    
    # Check face quality
    quality = face.get('Quality', {})
    if quality.get('Brightness', 0) > 50 and quality.get('Sharpness', 0) > 50:
        score += 0.2
    
    return min(score, 1.0)

@kyc_bp.route('/session-status/<session_token>', methods=['GET'])
@jwt_required()
def get_session_status(session_token):
    """Get KYC session status"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        kyc_session = KYCSession.query.filter_by(
            user_id=user.id,
            session_token=session_token
        ).first()
        
        if not kyc_session:
            return jsonify({'error': 'KYC session not found'}), 404
        
        return jsonify({
            'session': kyc_session.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Session status error: {e}")
        return jsonify({'error': 'Failed to get session status'}), 500

@kyc_bp.route('/complete-session', methods=['POST'])
@jwt_required()
def complete_kyc_session():
    """Complete KYC session and generate final assessment"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        session_token = data.get('session_token')
        
        if not session_token:
            return jsonify({'error': 'Session token is required'}), 400
        
        kyc_session = KYCSession.query.filter_by(
            user_id=user.id,
            session_token=session_token,
            status=KYCStatus.IN_PROGRESS
        ).first()
        
        if not kyc_session:
            return jsonify({'error': 'Invalid or expired KYC session'}), 404
        
        # Calculate final risk score
        risk_score = calculate_final_risk_score(kyc_session)
        
        # Determine final status
        if risk_score < 0.3:
            final_status = KYCStatus.APPROVED
        elif risk_score < 0.7:
            final_status = KYCStatus.REQUIRES_REVIEW
        else:
            final_status = KYCStatus.REJECTED
        
        # Update session
        kyc_session.status = final_status
        kyc_session.risk_score = risk_score
        kyc_session.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        # Log completion
        audit_log = AuditLog(
            user_id=user.id,
            action='kyc_session_complete',
            resource='kyc_session',
            resource_id=str(kyc_session.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            details={'final_status': final_status.value, 'risk_score': risk_score}
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'KYC session completed',
            'session': kyc_session.to_dict(),
            'final_status': final_status.value,
            'risk_score': risk_score
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"KYC completion error: {e}")
        return jsonify({'error': 'Failed to complete KYC session'}), 500

def calculate_final_risk_score(kyc_session):
    """Calculate final risk score based on all KYC data"""
    base_score = 0.5  # Start with neutral score
    
    # Analyze face analysis results
    if kyc_session.face_analysis_result:
        face_data = kyc_session.face_analysis_result
        if face_data.get('faces_detected', 0) == 1:
            base_score -= 0.2  # Good - single face detected
        elif face_data.get('faces_detected', 0) > 1:
            base_score += 0.3  # Risk - multiple faces
        else:
            base_score += 0.5  # High risk - no face detected
    
    # Analyze document verification results
    if kyc_session.document_analysis_result:
        doc_data = kyc_session.document_analysis_result
        if doc_data.get('is_valid', False):
            base_score -= 0.2
        else:
            base_score += 0.3
    
    # Analyze liveness check results
    if kyc_session.liveness_check_result:
        liveness_data = kyc_session.liveness_check_result
        liveness_score = liveness_data.get('average_score', 0)
        if liveness_score > 0.8:
            base_score -= 0.2
        elif liveness_score < 0.5:
            base_score += 0.4
    
    return max(0.0, min(1.0, base_score))

# Async task for video analysis (would use Celery in production)
def analyze_kyc_video_async(session_id, video_s3_key):
    """Analyze KYC video asynchronously"""
    # This would be implemented as a Celery task in production
    # For now, we'll simulate the analysis
    pass
