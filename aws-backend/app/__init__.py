"""
Alhambra Bank & Trust - Flask Backend Application
AWS-integrated banking platform with video KYC and zero-trust security
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='production'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    
    # Database configuration
    if config_name == 'production':
        # PostgreSQL for production
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
            'DATABASE_URL',
            'postgresql://alhambra_user:password@localhost/alhambra_bank'
        )
    else:
        # SQLite for development
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///alhambra_bank.db'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # AWS Configuration
    app.config['AWS_REGION'] = os.environ.get('AWS_REGION', 'us-east-1')
    app.config['AWS_ACCESS_KEY_ID'] = os.environ.get('AWS_ACCESS_KEY_ID')
    app.config['AWS_SECRET_ACCESS_KEY'] = os.environ.get('AWS_SECRET_ACCESS_KEY')
    app.config['S3_BUCKET'] = os.environ.get('S3_BUCKET', 'alhambra-bank-documents')
    app.config['COGNITO_USER_POOL_ID'] = os.environ.get('COGNITO_USER_POOL_ID')
    app.config['COGNITO_CLIENT_ID'] = os.environ.get('COGNITO_CLIENT_ID')
    
    # CORS configuration
    CORS(app, origins=['*'], supports_credentials=True)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.kyc import kyc_bp
    from .routes.documents import documents_bp
    from .routes.accounts import accounts_bp
    from .routes.communication import communication_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(kyc_bp, url_prefix='/api/kyc')
    app.register_blueprint(documents_bp, url_prefix='/api/documents')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(communication_bp, url_prefix='/api/communication')
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'alhambra-bank-api'}
    
    return app
