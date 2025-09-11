"""
Zero-Trust Security Framework for Alhambra Bank & Trust
Comprehensive security utilities and threat detection
"""

import hashlib
import hmac
import secrets
import time
import json
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import request, current_app, g
import boto3
from botocore.exceptions import ClientError
import jwt
from ..models import SecurityEvent, AuditLog, User, db
import geoip2.database
import user_agents

class SecurityManager:
    """Central security management class"""
    
    def __init__(self):
        self.failed_attempts = {}  # In-memory store for failed attempts
        self.suspicious_ips = set()
        self.blocked_ips = set()
        
    def is_ip_blocked(self, ip_address):
        """Check if IP is blocked"""
        return ip_address in self.blocked_ips
    
    def block_ip(self, ip_address, reason="Security violation"):
        """Block an IP address"""
        self.blocked_ips.add(ip_address)
        log_security_event('ip_blocked', 'high', ip_address, reason)
    
    def get_failed_attempts(self, identifier):
        """Get failed attempt count for identifier (IP or user)"""
        return self.failed_attempts.get(identifier, 0)
    
    def increment_failed_attempts(self, identifier):
        """Increment failed attempts counter"""
        self.failed_attempts[identifier] = self.failed_attempts.get(identifier, 0) + 1
        
        # Auto-block after 5 failed attempts
        if self.failed_attempts[identifier] >= 5:
            if '.' in identifier:  # IP address
                self.block_ip(identifier, "Too many failed attempts")
    
    def reset_failed_attempts(self, identifier):
        """Reset failed attempts counter"""
        if identifier in self.failed_attempts:
            del self.failed_attempts[identifier]

# Global security manager instance
security_manager = SecurityManager()

def validate_request_security(request):
    """
    Comprehensive request security validation
    Implements zero-trust principles
    """
    try:
        # Get client IP
        client_ip = get_client_ip(request)
        
        # Check if IP is blocked
        if security_manager.is_ip_blocked(client_ip):
            return {
                'valid': False,
                'reason': 'IP address is blocked',
                'risk_level': 'critical'
            }
        
        # Rate limiting check
        rate_limit_result = check_rate_limit(client_ip)
        if not rate_limit_result['allowed']:
            return {
                'valid': False,
                'reason': 'Rate limit exceeded',
                'risk_level': 'high'
            }
        
        # Geolocation analysis
        geo_analysis = analyze_geolocation(client_ip)
        
        # User agent analysis
        ua_analysis = analyze_user_agent(request.headers.get('User-Agent', ''))
        
        # Request pattern analysis
        pattern_analysis = analyze_request_patterns(request)
        
        # Calculate overall risk score
        risk_score = calculate_risk_score({
            'geo': geo_analysis,
            'user_agent': ua_analysis,
            'patterns': pattern_analysis,
            'ip': client_ip
        })
        
        # Determine if request should be allowed
        if risk_score > 0.8:
            security_manager.increment_failed_attempts(client_ip)
            return {
                'valid': False,
                'reason': 'High risk score detected',
                'risk_level': 'high',
                'risk_score': risk_score
            }
        
        return {
            'valid': True,
            'risk_score': risk_score,
            'geo_info': geo_analysis,
            'user_agent_info': ua_analysis
        }
        
    except Exception as e:
        current_app.logger.error(f"Security validation error: {e}")
        return {
            'valid': False,
            'reason': 'Security validation failed',
            'risk_level': 'medium'
        }

def get_client_ip(request):
    """Get the real client IP address"""
    # Check for forwarded headers (common in load balancers)
    forwarded_ips = request.headers.get('X-Forwarded-For')
    if forwarded_ips:
        return forwarded_ips.split(',')[0].strip()
    
    real_ip = request.headers.get('X-Real-IP')
    if real_ip:
        return real_ip
    
    return request.remote_addr

def check_rate_limit(identifier, limit=100, window=3600):
    """
    Rate limiting implementation
    Default: 100 requests per hour
    """
    current_time = int(time.time())
    window_start = current_time - window
    
    # In production, use Redis for distributed rate limiting
    # For now, using in-memory storage
    if not hasattr(g, 'rate_limit_store'):
        g.rate_limit_store = {}
    
    if identifier not in g.rate_limit_store:
        g.rate_limit_store[identifier] = []
    
    # Clean old entries
    g.rate_limit_store[identifier] = [
        timestamp for timestamp in g.rate_limit_store[identifier]
        if timestamp > window_start
    ]
    
    # Check if limit exceeded
    if len(g.rate_limit_store[identifier]) >= limit:
        return {
            'allowed': False,
            'remaining': 0,
            'reset_time': window_start + window
        }
    
    # Add current request
    g.rate_limit_store[identifier].append(current_time)
    
    return {
        'allowed': True,
        'remaining': limit - len(g.rate_limit_store[identifier]),
        'reset_time': window_start + window
    }

def analyze_geolocation(ip_address):
    """Analyze IP geolocation for risk assessment"""
    try:
        # In production, use MaxMind GeoIP2 database
        # For demo, return mock data
        
        # High-risk countries (example list)
        high_risk_countries = ['CN', 'RU', 'KP', 'IR']
        
        # Mock geolocation data
        mock_geo = {
            'country': 'US',
            'city': 'New York',
            'is_vpn': False,
            'is_tor': False,
            'is_proxy': False,
            'risk_score': 0.1
        }
        
        # Increase risk for high-risk countries
        if mock_geo['country'] in high_risk_countries:
            mock_geo['risk_score'] = 0.7
        
        # Increase risk for VPN/Proxy/Tor
        if mock_geo['is_vpn'] or mock_geo['is_tor'] or mock_geo['is_proxy']:
            mock_geo['risk_score'] += 0.3
        
        return mock_geo
        
    except Exception as e:
        current_app.logger.error(f"Geolocation analysis error: {e}")
        return {'risk_score': 0.5, 'error': str(e)}

def analyze_user_agent(user_agent_string):
    """Analyze user agent for suspicious patterns"""
    try:
        if not user_agent_string:
            return {'risk_score': 0.8, 'reason': 'Missing user agent'}
        
        # Parse user agent
        user_agent = user_agents.parse(user_agent_string)
        
        analysis = {
            'browser': user_agent.browser.family,
            'os': user_agent.os.family,
            'device': user_agent.device.family,
            'is_bot': user_agent.is_bot,
            'is_mobile': user_agent.is_mobile,
            'risk_score': 0.0
        }
        
        # Increase risk for bots
        if analysis['is_bot']:
            analysis['risk_score'] += 0.6
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'curl', r'wget', r'python', r'java', r'scanner',
            r'bot', r'crawler', r'spider', r'scraper'
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, user_agent_string, re.IGNORECASE):
                analysis['risk_score'] += 0.4
                analysis['suspicious_pattern'] = pattern
                break
        
        return analysis
        
    except Exception as e:
        current_app.logger.error(f"User agent analysis error: {e}")
        return {'risk_score': 0.3, 'error': str(e)}

def analyze_request_patterns(request):
    """Analyze request patterns for anomalies"""
    try:
        analysis = {
            'method': request.method,
            'path': request.path,
            'has_json': request.is_json,
            'content_length': request.content_length or 0,
            'risk_score': 0.0
        }
        
        # Check for suspicious paths
        suspicious_paths = [
            '/admin', '/wp-admin', '/.env', '/config',
            '/phpmyadmin', '/sql', '/backup'
        ]
        
        for path in suspicious_paths:
            if path in request.path.lower():
                analysis['risk_score'] += 0.7
                analysis['suspicious_path'] = path
                break
        
        # Check for large payloads (potential DoS)
        if analysis['content_length'] > 10 * 1024 * 1024:  # 10MB
            analysis['risk_score'] += 0.5
            analysis['large_payload'] = True
        
        # Check for SQL injection patterns in query parameters
        sql_patterns = [
            r'union\s+select', r'drop\s+table', r'insert\s+into',
            r'delete\s+from', r'update\s+set', r'exec\s*\(',
            r'script\s*>', r'<\s*script'
        ]
        
        query_string = request.query_string.decode('utf-8', errors='ignore')
        for pattern in sql_patterns:
            if re.search(pattern, query_string, re.IGNORECASE):
                analysis['risk_score'] += 0.8
                analysis['sql_injection_attempt'] = True
                break
        
        return analysis
        
    except Exception as e:
        current_app.logger.error(f"Request pattern analysis error: {e}")
        return {'risk_score': 0.2, 'error': str(e)}

def calculate_risk_score(analysis_data):
    """Calculate overall risk score from various analyses"""
    try:
        base_score = 0.0
        
        # Geolocation risk
        geo_risk = analysis_data.get('geo', {}).get('risk_score', 0.0)
        base_score += geo_risk * 0.3
        
        # User agent risk
        ua_risk = analysis_data.get('user_agent', {}).get('risk_score', 0.0)
        base_score += ua_risk * 0.3
        
        # Request pattern risk
        pattern_risk = analysis_data.get('patterns', {}).get('risk_score', 0.0)
        base_score += pattern_risk * 0.4
        
        # Normalize to 0-1 range
        return min(base_score, 1.0)
        
    except Exception as e:
        current_app.logger.error(f"Risk score calculation error: {e}")
        return 0.5  # Default medium risk

def log_security_event(event_type, severity, source_ip, description, user_id=None, metadata=None):
    """Log security events to database"""
    try:
        security_event = SecurityEvent(
            event_type=event_type,
            severity=severity,
            source_ip=source_ip,
            user_id=user_id,
            description=description,
            metadata=metadata or {}
        )
        
        db.session.add(security_event)
        db.session.commit()
        
        # Log to application logger as well
        current_app.logger.warning(
            f"Security Event: {event_type} | Severity: {severity} | "
            f"IP: {source_ip} | Description: {description}"
        )
        
    except Exception as e:
        current_app.logger.error(f"Failed to log security event: {e}")

def require_mfa(f):
    """Decorator to require multi-factor authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if user has completed MFA
        if not g.get('mfa_verified', False):
            return {'error': 'Multi-factor authentication required'}, 401
        return f(*args, **kwargs)
    return decorated_function

def encrypt_sensitive_data(data, key=None):
    """Encrypt sensitive data using AES encryption"""
    try:
        from cryptography.fernet import Fernet
        
        if not key:
            key = current_app.config.get('ENCRYPTION_KEY')
            if not key:
                # Generate a key (in production, store securely)
                key = Fernet.generate_key()
        
        f = Fernet(key)
        encrypted_data = f.encrypt(data.encode() if isinstance(data, str) else data)
        return encrypted_data
        
    except Exception as e:
        current_app.logger.error(f"Encryption error: {e}")
        raise

def decrypt_sensitive_data(encrypted_data, key=None):
    """Decrypt sensitive data"""
    try:
        from cryptography.fernet import Fernet
        
        if not key:
            key = current_app.config.get('ENCRYPTION_KEY')
        
        f = Fernet(key)
        decrypted_data = f.decrypt(encrypted_data)
        return decrypted_data.decode()
        
    except Exception as e:
        current_app.logger.error(f"Decryption error: {e}")
        raise

def generate_secure_token(length=32):
    """Generate cryptographically secure random token"""
    return secrets.token_urlsafe(length)

def hash_password_secure(password, salt=None):
    """Secure password hashing with salt"""
    if not salt:
        salt = secrets.token_hex(16)
    
    # Use PBKDF2 with SHA-256
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # 100,000 iterations
    )
    
    return {
        'hash': password_hash.hex(),
        'salt': salt
    }

def verify_password_secure(password, stored_hash, salt):
    """Verify password against stored hash"""
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    
    return hmac.compare_digest(password_hash.hex(), stored_hash)

def create_jwt_token(user_id, additional_claims=None):
    """Create JWT token with security claims"""
    payload = {
        'user_id': str(user_id),
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1),
        'iss': 'alhambra-bank',
        'aud': 'alhambra-bank-api'
    }
    
    if additional_claims:
        payload.update(additional_claims)
    
    token = jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return token

def verify_jwt_token(token):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256'],
            audience='alhambra-bank-api',
            issuer='alhambra-bank'
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception('Token has expired')
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')

class SecurityMiddleware:
    """Security middleware for request processing"""
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """Process request before handling"""
        # Skip security checks for health endpoint
        if request.endpoint == 'health_check':
            return
        
        # Validate request security
        security_result = validate_request_security(request)
        
        if not security_result['valid']:
            log_security_event(
                'request_blocked',
                security_result.get('risk_level', 'medium'),
                get_client_ip(request),
                security_result['reason']
            )
            return {'error': 'Request blocked for security reasons'}, 403
        
        # Store security info in request context
        g.security_info = security_result
    
    def after_request(self, response):
        """Process response after handling"""
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        
        return response
