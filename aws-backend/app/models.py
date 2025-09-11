"""
Database models for Alhambra Bank & Trust platform
"""

from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from sqlalchemy.dialects.postgresql import UUID
import enum

class AccountType(enum.Enum):
    INDIVIDUAL = "individual"
    CORPORATE = "corporate"

class KYCStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_REVIEW = "requires_review"

class DocumentType(enum.Enum):
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    INCORPORATION_CERTIFICATE = "incorporation_certificate"
    MEMORANDUM_ARTICLES = "memorandum_articles"

class User(db.Model):
    """User model for authentication and basic information"""
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    preferred_language = db.Column(db.String(5), default='en')
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    cognito_user_id = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    account_applications = db.relationship('AccountApplication', backref='user', lazy=True)
    kyc_sessions = db.relationship('KYCSession', backref='user', lazy=True)
    documents = db.relationship('Document', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'preferred_language': self.preferred_language,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AccountApplication(db.Model):
    """Account opening applications"""
    __tablename__ = 'account_applications'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    account_type = db.Column(db.Enum(AccountType), nullable=False)
    status = db.Column(db.String(50), default='draft')
    application_data = db.Column(db.JSON)
    risk_assessment = db.Column(db.JSON)
    compliance_checks = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'account_type': self.account_type.value,
            'status': self.status,
            'application_data': self.application_data,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class KYCSession(db.Model):
    """Video KYC sessions with AI analysis"""
    __tablename__ = 'kyc_sessions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(255), unique=True, nullable=False)
    status = db.Column(db.Enum(KYCStatus), default=KYCStatus.PENDING)
    video_s3_key = db.Column(db.String(500))
    face_analysis_result = db.Column(db.JSON)
    document_analysis_result = db.Column(db.JSON)
    liveness_check_result = db.Column(db.JSON)
    risk_score = db.Column(db.Float)
    agent_notes = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'session_token': self.session_token,
            'status': self.status.value,
            'risk_score': self.risk_score,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class Document(db.Model):
    """Document storage and analysis"""
    __tablename__ = 'documents'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    document_type = db.Column(db.Enum(DocumentType), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    s3_key = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    ocr_result = db.Column(db.JSON)
    validation_result = db.Column(db.JSON)
    is_verified = db.Column(db.Boolean, default=False)
    verification_notes = db.Column(db.Text)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'document_type': self.document_type.value,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'is_verified': self.is_verified,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }

class AuditLog(db.Model):
    """Security audit logging"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(100))
    resource_id = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    details = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id) if self.user_id else None,
            'action': self.action,
            'resource': self.resource,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class SecurityEvent(db.Model):
    """Security events and threat detection"""
    __tablename__ = 'security_events'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    source_ip = db.Column(db.String(45))
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    description = db.Column(db.Text)
    metadata = db.Column(db.JSON)
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_by = db.Column(db.String(255))
    resolved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'event_type': self.event_type,
            'severity': self.severity,
            'source_ip': self.source_ip,
            'description': self.description,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
