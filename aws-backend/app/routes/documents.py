"""
Document processing routes with AWS Rekognition and S3 integration
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
from botocore.exceptions import ClientError
import uuid
import json
import base64
from datetime import datetime
from PIL import Image
import io
import cv2
import numpy as np
from ..models import User, Document, AuditLog, db, DocumentType
from ..utils.security import log_security_event

documents_bp = Blueprint('documents', __name__)

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

def get_textract_client():
    """Get AWS Textract client for OCR"""
    return boto3.client(
        'textract',
        region_name=current_app.config['AWS_REGION'],
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY']
    )

@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload and process document"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is provided
        if 'document' not in request.files:
            return jsonify({'error': 'No document file provided'}), 400
        
        file = request.files['document']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get document type and analysis result
        document_type = request.form.get('document_type')
        analysis_result = request.form.get('analysis_result')
        
        if not document_type:
            return jsonify({'error': 'Document type is required'}), 400
        
        # Validate document type
        try:
            doc_type_enum = DocumentType(document_type)
        except ValueError:
            return jsonify({'error': 'Invalid document type'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'pdf'}
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        if file_extension not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, PDF'}), 400
        
        # Validate file size (max 10MB)
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({'error': 'File size exceeds 10MB limit'}), 400
        
        # Generate S3 key
        document_id = str(uuid.uuid4())
        s3_key = f"documents/{user.id}/{document_id}/{file.filename}"
        
        # Upload to S3
        s3_client = get_s3_client()
        try:
            s3_client.upload_fileobj(
                file,
                current_app.config['S3_BUCKET'],
                s3_key,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ServerSideEncryption': 'AES256',
                    'Metadata': {
                        'user_id': str(user.id),
                        'document_type': document_type,
                        'upload_timestamp': datetime.utcnow().isoformat()
                    }
                }
            )
        except ClientError as e:
            current_app.logger.error(f"S3 upload error: {e}")
            return jsonify({'error': 'Failed to upload document'}), 500
        
        # Create document record
        document = Document(
            user_id=user.id,
            document_type=doc_type_enum,
            original_filename=file.filename,
            s3_key=s3_key,
            file_size=file_size,
            mime_type=file.content_type
        )
        
        # Parse analysis result if provided
        if analysis_result:
            try:
                document.validation_result = json.loads(analysis_result)
            except json.JSONDecodeError:
                pass
        
        db.session.add(document)
        db.session.commit()
        
        # Start async document processing
        process_document_async.delay(str(document.id), s3_key)
        
        # Log document upload
        audit_log = AuditLog(
            user_id=user.id,
            action='document_upload',
            resource='document',
            resource_id=str(document.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            details={
                'document_type': document_type,
                'filename': file.filename,
                'file_size': file_size
            }
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': document.to_dict(),
            'processing_status': 'initiated'
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Document upload error: {e}")
        return jsonify({'error': 'Failed to upload document'}), 500

@documents_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_document():
    """Analyze document image for quality and content"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        image_data = data.get('image_data')
        document_type = data.get('document_type')
        
        if not image_data or not document_type:
            return jsonify({'error': 'Image data and document type are required'}), 400
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Analyze with AWS Rekognition
        rekognition_client = get_rekognition_client()
        
        analysis_result = {
            'documentDetected': False,
            'qualityScore': 0.0,
            'readabilityScore': 0.0,
            'textDetected': False,
            'faceDetected': False,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            # Text detection
            text_response = rekognition_client.detect_text(
                Image={'Bytes': image_bytes}
            )
            
            detected_text = []
            confidence_scores = []
            
            for text_detection in text_response['TextDetections']:
                if text_detection['Type'] == 'LINE':
                    detected_text.append(text_detection['DetectedText'])
                    confidence_scores.append(text_detection['Confidence'])
            
            if detected_text:
                analysis_result['textDetected'] = True
                analysis_result['detectedText'] = detected_text
                analysis_result['readabilityScore'] = sum(confidence_scores) / len(confidence_scores) / 100
            
            # Document-specific analysis
            if document_type in ['passport', 'drivers_license', 'national_id']:
                # Face detection for ID documents
                face_response = rekognition_client.detect_faces(
                    Image={'Bytes': image_bytes},
                    Attributes=['ALL']
                )
                
                if face_response['FaceDetails']:
                    analysis_result['faceDetected'] = True
                    analysis_result['faceCount'] = len(face_response['FaceDetails'])
                    
                    # Calculate face quality score
                    face_quality = face_response['FaceDetails'][0]['Quality']
                    face_score = (face_quality['Brightness'] + face_quality['Sharpness']) / 200
                    analysis_result['faceQuality'] = face_score
            
            # Quality assessment using image analysis
            quality_score = assess_image_quality(image_bytes)
            analysis_result['qualityScore'] = quality_score
            
            # Document detection heuristics
            document_score = detect_document_presence(image_bytes, detected_text, document_type)
            analysis_result['documentDetected'] = document_score > 0.6
            analysis_result['documentScore'] = document_score
            
        except ClientError as e:
            current_app.logger.error(f"Rekognition analysis error: {e}")
            return jsonify({'error': 'Document analysis failed'}), 500
        
        return jsonify(analysis_result), 200
        
    except Exception as e:
        current_app.logger.error(f"Document analysis error: {e}")
        return jsonify({'error': 'Failed to analyze document'}), 500

@documents_bp.route('/list', methods=['GET'])
@jwt_required()
def list_documents():
    """List user's uploaded documents"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        documents = Document.query.filter_by(user_id=user.id).order_by(Document.uploaded_at.desc()).all()
        
        return jsonify({
            'documents': [doc.to_dict() for doc in documents]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Document list error: {e}")
        return jsonify({'error': 'Failed to list documents'}), 500

@documents_bp.route('/<document_id>', methods=['GET'])
@jwt_required()
def get_document(document_id):
    """Get document details"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        document = Document.query.filter_by(id=document_id, user_id=user.id).first()
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({
            'document': document.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Document get error: {e}")
        return jsonify({'error': 'Failed to get document'}), 500

@documents_bp.route('/<document_id>/download', methods=['GET'])
@jwt_required()
def download_document(document_id):
    """Generate presigned URL for document download"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        document = Document.query.filter_by(id=document_id, user_id=user.id).first()
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Generate presigned URL
        s3_client = get_s3_client()
        try:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': current_app.config['S3_BUCKET'],
                    'Key': document.s3_key
                },
                ExpiresIn=3600  # 1 hour
            )
            
            # Log document access
            audit_log = AuditLog(
                user_id=user.id,
                action='document_download',
                resource='document',
                resource_id=str(document.id),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(audit_log)
            db.session.commit()
            
            return jsonify({
                'download_url': presigned_url,
                'expires_in': 3600
            }), 200
            
        except ClientError as e:
            current_app.logger.error(f"Presigned URL generation error: {e}")
            return jsonify({'error': 'Failed to generate download URL'}), 500
        
    except Exception as e:
        current_app.logger.error(f"Document download error: {e}")
        return jsonify({'error': 'Failed to prepare document download'}), 500

@documents_bp.route('/<document_id>/verify', methods=['POST'])
@jwt_required()
def verify_document(document_id):
    """Manually verify document (admin function)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # In production, check if user has admin privileges
        
        document = Document.query.get(document_id)
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        data = request.get_json()
        is_verified = data.get('is_verified', False)
        notes = data.get('notes', '')
        
        document.is_verified = is_verified
        document.verification_notes = notes
        db.session.commit()
        
        # Log verification action
        audit_log = AuditLog(
            user_id=user.id,
            action='document_verification',
            resource='document',
            resource_id=str(document.id),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            details={
                'is_verified': is_verified,
                'notes': notes
            }
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'message': 'Document verification updated',
            'document': document.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Document verification error: {e}")
        return jsonify({'error': 'Failed to verify document'}), 500

def assess_image_quality(image_bytes):
    """Assess image quality using computer vision techniques"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return 0.0
        
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate sharpness using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness_score = min(laplacian_var / 1000, 1.0)  # Normalize
        
        # Calculate brightness
        brightness = np.mean(gray) / 255.0
        brightness_score = 1.0 - abs(brightness - 0.5) * 2  # Optimal around 0.5
        
        # Calculate contrast
        contrast = gray.std() / 255.0
        contrast_score = min(contrast * 2, 1.0)  # Normalize
        
        # Overall quality score
        quality_score = (sharpness_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3)
        
        return quality_score
        
    except Exception as e:
        current_app.logger.error(f"Image quality assessment error: {e}")
        return 0.5  # Default medium quality

def detect_document_presence(image_bytes, detected_text, document_type):
    """Detect if image contains a document of the specified type"""
    try:
        # Document type keywords
        document_keywords = {
            'passport': ['passport', 'republic', 'states', 'nationality'],
            'drivers_license': ['license', 'driver', 'class', 'expires'],
            'national_id': ['identity', 'card', 'citizen', 'id'],
            'utility_bill': ['bill', 'statement', 'electric', 'gas', 'water', 'phone'],
            'bank_statement': ['statement', 'bank', 'account', 'balance', 'transaction']
        }
        
        keywords = document_keywords.get(document_type, [])
        
        if not detected_text or not keywords:
            return 0.5  # Default score
        
        # Count keyword matches
        text_lower = ' '.join(detected_text).lower()
        matches = sum(1 for keyword in keywords if keyword in text_lower)
        
        # Calculate score based on matches
        score = min(matches / len(keywords), 1.0)
        
        # Boost score if multiple lines of text detected (indicates structured document)
        if len(detected_text) > 3:
            score += 0.2
        
        return min(score, 1.0)
        
    except Exception as e:
        current_app.logger.error(f"Document detection error: {e}")
        return 0.5

# Async task for document processing (would use Celery in production)
def process_document_async(document_id, s3_key):
    """Process document asynchronously with OCR and validation"""
    try:
        # Get document from database
        document = Document.query.get(document_id)
        if not document:
            return
        
        # Perform OCR using AWS Textract
        textract_client = get_textract_client()
        
        try:
            response = textract_client.detect_document_text(
                Document={
                    'S3Object': {
                        'Bucket': current_app.config['S3_BUCKET'],
                        'Name': s3_key
                    }
                }
            )
            
            # Extract text and confidence scores
            extracted_text = []
            for block in response['Blocks']:
                if block['BlockType'] == 'LINE':
                    extracted_text.append({
                        'text': block['Text'],
                        'confidence': block['Confidence']
                    })
            
            # Store OCR results
            document.ocr_result = {
                'extracted_text': extracted_text,
                'processed_at': datetime.utcnow().isoformat()
            }
            
            # Perform document validation based on type
            validation_result = validate_document_content(document.document_type, extracted_text)
            document.validation_result = validation_result
            
            # Auto-verify if validation score is high
            if validation_result.get('overall_score', 0) > 0.8:
                document.is_verified = True
                document.verification_notes = 'Auto-verified based on high confidence score'
            
            db.session.commit()
            
        except ClientError as e:
            current_app.logger.error(f"Textract processing error: {e}")
            document.ocr_result = {'error': str(e)}
            db.session.commit()
        
    except Exception as e:
        current_app.logger.error(f"Document processing error: {e}")

def validate_document_content(document_type, extracted_text):
    """Validate document content based on type"""
    try:
        validation_result = {
            'document_type': document_type.value,
            'validation_checks': [],
            'overall_score': 0.0
        }
        
        text_content = ' '.join([item['text'] for item in extracted_text]).lower()
        
        # Document-specific validation rules
        if document_type == DocumentType.PASSPORT:
            checks = [
                ('passport_keyword', 'passport' in text_content),
                ('country_mentioned', any(country in text_content for country in ['states', 'kingdom', 'republic'])),
                ('has_numbers', any(char.isdigit() for char in text_content))
            ]
        elif document_type == DocumentType.DRIVERS_LICENSE:
            checks = [
                ('license_keyword', 'license' in text_content or 'licence' in text_content),
                ('driver_mentioned', 'driver' in text_content),
                ('expiration_date', 'exp' in text_content or 'expires' in text_content)
            ]
        else:
            # Generic document checks
            checks = [
                ('has_text', len(extracted_text) > 0),
                ('readable_confidence', sum(item['confidence'] for item in extracted_text) / len(extracted_text) > 80 if extracted_text else False)
            ]
        
        # Evaluate checks
        passed_checks = 0
        for check_name, check_result in checks:
            validation_result['validation_checks'].append({
                'check': check_name,
                'passed': check_result
            })
            if check_result:
                passed_checks += 1
        
        # Calculate overall score
        validation_result['overall_score'] = passed_checks / len(checks) if checks else 0.0
        
        return validation_result
        
    except Exception as e:
        current_app.logger.error(f"Document validation error: {e}")
        return {'error': str(e), 'overall_score': 0.0}
