import os
import json
import secrets
import bcrypt
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timedelta
import logging
from logging.handlers import RotatingFileHandler
import shutil
import csv
from io import StringIO, BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from html import escape
import bleach
import re

app = Flask(__name__, static_folder='static')

FLASK_ENV = os.getenv('FLASK_ENV', 'development').lower()
IS_PRODUCTION = FLASK_ENV == 'production'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///journal.db?timeout=10'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True, 'pool_recycle': 3600}
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './flask_session'
app.config['SESSION_PERMANENT'] = True
Session(app)

USERNAME = os.getenv('APP_USERNAME', 'admin')
DEFAULT_PASSWORD_HASH = bcrypt.hashpw('admin'.encode(), bcrypt.gensalt()).decode('utf-8')
PASSWORD_HASH = os.getenv('APP_PASSWORD_HASH', DEFAULT_PASSWORD_HASH)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

db = SQLAlchemy(app)

MAX_STRING_LENGTH = 10000
MAX_CYCLES = 50
MAX_ACTIVITIES = 100

def sanitize_string(text, max_length=MAX_STRING_LENGTH):
    if not text:
        return ""
    clean = bleach.clean(text, tags=[], strip=True)
    return clean[:max_length]

def validate_date(date_str):
    """Validate date format YYYY-MM-DD"""
    if not date_str:
        return False
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if not re.match(pattern, date_str):
        return False
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_time(time_str):
    """Validate time format HH:MM"""
    if not time_str:
        return True
    pattern = r'^\d{2}:\d{2}$'
    if not re.match(pattern, time_str):
        return False
    try:
        hours, minutes = map(int, time_str.split(':'))
        return 0 <= hours <= 23 and 0 <= minutes <= 59
    except:
        return False

def validate_number(num, min_val=0, max_val=10):
    """Validate number is within range"""
    try:
        val = int(num) if isinstance(num, str) else num
        return min_val <= val <= max_val
    except:
        return False

def sanitize_entry_data(data):
    """Sanitize and validate entry data"""
    if not isinstance(data, dict):
        return None

    sanitized = {}

    if 'date' in data:
        if not validate_date(data['date']):
            return None
        sanitized['date'] = data['date']

    for field in ['thoughts', 'day', 'notes', 'mood', 'dailyNote']:
        if field in data:
            sanitized[field] = sanitize_string(data.get(field, ''))

    if 'generalMood' in data:
        mood = data['generalMood']
        if mood and not validate_number(mood, 0, 10):
            sanitized['generalMood'] = 5
        else:
            sanitized['generalMood'] = mood

    if 'sleep' in data and isinstance(data['sleep'], dict):
        sleep_obj = data['sleep']
        sanitized['sleep'] = {}
        if 'bedtime' in sleep_obj and validate_time(sleep_obj['bedtime']):
            sanitized['sleep']['bedtime'] = sleep_obj['bedtime']
        if 'wake' in sleep_obj and validate_time(sleep_obj['wake']):
            sanitized['sleep']['wake'] = sleep_obj['wake']
        if 'quality' in sleep_obj:
            quality = sleep_obj['quality']
            if validate_number(quality, 0, 10):
                sanitized['sleep']['quality'] = int(quality)

    for field in ['bedtime', 'wakeup']:
        if field in data:
            times = data[field] if isinstance(data[field], list) else []
            sanitized[field] = [t for t in times if validate_time(t)][:10]

    if 'sleepHours' in data:
        sleep = data['sleepHours']
        if isinstance(sleep, list) and len(sleep) <= 24:
            sanitized['sleepHours'] = [bool(x) for x in sleep]
        else:
            sanitized['sleepHours'] = []

    for field in ['exercise', 'caffeine', 'cannabis', 'medication', 'custom']:
        if field in data:
            items = data[field] if isinstance(data[field], list) else []
            sanitized[field] = []
            for item in items[:50]:
                if isinstance(item, str):
                    sanitized[field].append(sanitize_string(item, 200))
                elif isinstance(item, dict) and 'time' in item:
                    if validate_time(item['time']):
                        sanitized[field].append({'time': item['time']})

    if 'activityLog' in data:
        activities = data['activityLog'] if isinstance(data['activityLog'], list) else []
        sanitized['activityLog'] = []
        for slot_data in activities[:24]:
            if isinstance(slot_data, dict):
                slot = {
                    'slot': sanitize_string(slot_data.get('slot', ''), 50),
                    'activities': []
                }
                acts = slot_data.get('activities', [])
                for act in acts[:20]:
                    if isinstance(act, dict):
                        sanitized_act = {
                            'id': int(act.get('id', 0)),
                            'name': sanitize_string(act.get('name', ''), 500),
                            'plaisir': min(max(int(act.get('plaisir', 5)), 0), 10),
                            'maitrise': min(max(int(act.get('maitrise', 5)), 0), 10),
                            'satisfaction': min(max(int(act.get('satisfaction', 5)), 0), 10)
                        }
                        slot['activities'].append(sanitized_act)
                sanitized['activityLog'].append(slot)

    if 'timeSlots' in data:
        timeslots = data['timeSlots'] if isinstance(data['timeSlots'], list) else []
        sanitized['timeSlots'] = []
        for slot_data in timeslots[:24]:
            if isinstance(slot_data, dict):
                slot = {
                    'time': sanitize_string(slot_data.get('time', ''), 50),
                    'activities': []
                }
                acts = slot_data.get('activities', [])
                for act in acts[:20]:
                    if isinstance(act, dict):
                        sanitized_act = {
                            'id': int(act.get('id', 0)),
                            'name': sanitize_string(act.get('name', ''), 500),
                            'plaisir': min(max(int(act.get('plaisir', 5)), 0), 10),
                            'maitrise': min(max(int(act.get('maitrise', 5)), 0), 10),
                            'satisfaction': min(max(int(act.get('satisfaction', 5)), 0), 10)
                        }
                        slot['activities'].append(sanitized_act)
                sanitized['timeSlots'].append(slot)

    if 'viciousCycles' in data:
        cycles = data['viciousCycles'] if isinstance(data['viciousCycles'], list) else []
        sanitized['viciousCycles'] = []
        for cycle in cycles[:MAX_CYCLES]:
            if isinstance(cycle, dict):
                sanitized_cycle = {
                    'id': int(cycle.get('id', 0)),
                    'situation': sanitize_string(cycle.get('situation', ''), 1000),
                    'emotions': [],
                    'thoughts': [],
                    'behaviors': [],
                    'consequences': []
                }

                for emo in (cycle.get('emotions', []) or [])[:20]:
                    if isinstance(emo, dict):
                        sanitized_cycle['emotions'].append({
                            'id': int(emo.get('id', 0)),
                            'name': sanitize_string(emo.get('name', ''), 200),
                            'score': min(max(int(emo.get('score', 5)), 0), 10)
                        })

                for field in ['thoughts', 'behaviors', 'consequences']:
                    items = cycle.get(field, []) or []
                    for item in items[:20]:
                        if isinstance(item, dict):
                            sanitized_cycle[field].append({
                                'id': int(item.get('id', 0)),
                                'text': sanitize_string(item.get('text', ''), 2000)
                            })

                sanitized['viciousCycles'].append(sanitized_cycle)

    return sanitized

if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/journal.log', maxBytes=10000000, backupCount=3)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
app.logger.addHandler(file_handler)

if IS_PRODUCTION:
    app.logger.setLevel(logging.WARNING)
else:
    app.logger.setLevel(logging.DEBUG)

@app.before_request
def verify_origin():
    if request.method in ['GET', 'HEAD', 'OPTIONS'] or request.path == '/api/login':
        return None

    origin = request.headers.get('Origin') or request.headers.get('Referer', '')

    if IS_PRODUCTION and origin:
        from urllib.parse import urlparse
        parsed_origin = urlparse(origin)
        expected_host = request.host

        if parsed_origin.netloc and parsed_origin.netloc != expected_host:
            app.logger.warning(f"CSRF attempt detected: Origin {origin} doesn't match {expected_host}")
            return jsonify({"error": "Invalid request origin"}), 403

    return None

OLD_DATA_FILE = 'sleep_data.json'
BACKUP_DIR = 'backups'
DATABASE_FILE = 'instance/journal.db'

def create_backup():
    try:
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)

        if not os.path.exists(DATABASE_FILE):
            app.logger.warning("Database file not found for backup")
            return False

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(BACKUP_DIR, f'journal_backup_{timestamp}.db')

        shutil.copy2(DATABASE_FILE, backup_file)
        app.logger.info(f"Backup created: {backup_file}")

        cleanup_old_backups()
        return True
    except Exception as e:
        app.logger.error(f"Backup failed: {e}")
        return False

def cleanup_old_backups(keep=30):
    try:
        if not os.path.exists(BACKUP_DIR):
            return

        backups = []
        for filename in os.listdir(BACKUP_DIR):
            if filename.startswith('journal_backup_') and filename.endswith('.db'):
                filepath = os.path.join(BACKUP_DIR, filename)
                backups.append((filepath, os.path.getmtime(filepath)))

        backups.sort(key=lambda x: x[1], reverse=True)

        for filepath, _ in backups[keep:]:
            os.remove(filepath)
            app.logger.info(f"Removed old backup: {filepath}")
    except Exception as e:
        app.logger.error(f"Backup cleanup failed: {e}")

def should_create_backup():
    try:
        if not os.path.exists(BACKUP_DIR):
            return True

        backups = []
        for filename in os.listdir(BACKUP_DIR):
            if filename.startswith('journal_backup_') and filename.endswith('.db'):
                filepath = os.path.join(BACKUP_DIR, filename)
                backups.append((filepath, os.path.getmtime(filepath)))

        if not backups:
            return True

        most_recent = max(backups, key=lambda x: x[1])
        last_backup_time = datetime.fromtimestamp(most_recent[1])

        return (datetime.now() - last_backup_time).total_seconds() > 86400
    except Exception as e:
        app.logger.error(f"Backup check failed: {e}")
        return True

def require_login(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({"error": "Not authenticated"}), 401
        return f(*args, **kwargs)
    return decorated

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({"error": "Not authenticated"}), 401
        if not session.get('is_admin'):
            app.logger.warning(f"Unauthorized admin access attempt by user {session.get('user_id')}")
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)
    return decorated

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    entries = db.relationship('JournalEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    settings = db.relationship('Settings', backref='user', lazy=True, cascade='all, delete-orphan', uselist=False)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_sensitive:
            data['password_hash'] = self.password_hash
        return data

class JournalEntry(db.Model):
    __tablename__ = 'entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    content = db.Column(db.JSON, nullable=False)
    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='unique_user_date'),
    )

    def to_dict(self):
        data = self.content.copy()
        data['date'] = self.date
        return data

class Settings(db.Model):
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    data = db.Column(db.JSON, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def migrate_json_to_db():
    if not os.path.exists(OLD_DATA_FILE):
        return
    try:
        with open(OLD_DATA_FILE, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
        count = 0
        for date_key, entry_data in old_data.items():
            if not JournalEntry.query.get(date_key):
                new_entry = JournalEntry(date=date_key, content=entry_data)
                db.session.add(new_entry)
                count += 1
        db.session.commit()
        if count > 0:
            os.rename(OLD_DATA_FILE, OLD_DATA_FILE + '.bak')
            print(f"✅ Migrated {count} entries")
    except Exception as e:
        print(f"Migration error: {e}")
        db.session.rollback()

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

with app.app_context():
    db.create_all()
    migrate_json_to_db()
    if should_create_backup():
        create_backup()

@app.route('/')
def index():
    # Serve from dist/ (Vite build) first, fallback to root
    if os.path.exists('dist/index.html'):
        return send_from_directory('dist', 'index.html')
    if os.path.exists('index.html'):
        return send_from_directory('.', 'index.html')
    return jsonify({"error": "Frontend not found. Run 'npm run build' first."}), 404

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('dist/assets', filename)

@app.route('/manifest.json')
def serve_manifest():
    if os.path.exists('public/manifest.json'):
        return send_from_directory('public', 'manifest.json')
    return jsonify({}), 404

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per 15 minutes")
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing credentials"}), 400

    if len(username) > 100 or len(password) > 100:
        return jsonify({"error": "Invalid credentials"}), 400

    username = sanitize_string(username, 100)

    try:
        user = User.query.filter_by(username=username).first()

        if not user:
            try:
                password_matches = bcrypt.checkpw(
                    password.encode('utf-8'),
                    PASSWORD_HASH.encode('utf-8')
                )
                if username == USERNAME and password_matches:
                    admin_user = User.query.filter_by(username=USERNAME, is_admin=True).first()
                    if not admin_user:
                        admin_user = User(
                            username=USERNAME,
                            password_hash=PASSWORD_HASH,
                            is_admin=True,
                            is_active=True
                        )
                        db.session.add(admin_user)
                        db.session.commit()
                        app.logger.info(f"Auto-created admin user from .env: {USERNAME}")

                    user = admin_user
                else:
                    app.logger.warning(f"Failed login attempt for {username} from {request.remote_addr}")
                    return jsonify({"error": "Invalid credentials"}), 401
            except Exception as e:
                app.logger.error(f"Password verification error: {e}")
                app.logger.warning(f"Failed login attempt for {username} from {request.remote_addr}")
                return jsonify({"error": "Invalid credentials"}), 401
        else:
            if not user.is_active:
                app.logger.warning(f"Login attempt for inactive user {username} from {request.remote_addr}")
                return jsonify({"error": "Account is disabled"}), 403

            password_matches = bcrypt.checkpw(
                password.encode('utf-8'),
                user.password_hash.encode('utf-8')
            )

            if not password_matches:
                app.logger.warning(f"Failed login attempt for {username} from {request.remote_addr}")
                return jsonify({"error": "Invalid credentials"}), 401

        session.permanent = True
        session['logged_in'] = True
        session['user_id'] = user.id
        session['username'] = user.username
        session['is_admin'] = user.is_admin

        app.logger.info(f"User {user.username} (ID: {user.id}) logged in from {request.remote_addr}")

        return jsonify({
            "status": "success",
            "message": "Logged in",
            "user": {
                "id": user.id,
                "username": user.username,
                "is_admin": user.is_admin
            }
        })

    except Exception as e:
        app.logger.error(f"Login error: {e}")
        return jsonify({"error": "Authentication error"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    username = session.get('username')
    session.clear()
    app.logger.info(f"User {username} logged out")
    return jsonify({"status": "success", "message": "Logged out"})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if session.get('logged_in'):
        return jsonify({
            "authenticated": True,
            "username": session.get('username'),
            "user_id": session.get('user_id'),
            "is_admin": session.get('is_admin', False)
        })
    return jsonify({"authenticated": False}), 401

@app.route('/api/entries', methods=['GET'])
@require_login
def get_entries():
    try:
        user_id = session.get('user_id')
        entries = JournalEntry.query.filter_by(user_id=user_id).all()
        result = {entry.date: entry.to_dict() for entry in entries}
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Read error: {e}")
        return jsonify({"error": "Server error"}), 500

def validate_journal_entry(data):
    """Validate journal entry data to prevent injection and corruption"""
    if not isinstance(data, dict):
        return False, "Data must be an object"

    # Validate date field
    date_key = data.get('date')
    if not date_key or not isinstance(date_key, str):
        return False, "Missing or invalid date"

    try:
        datetime.strptime(date_key, '%Y-%m-%d')
    except ValueError:
        return False, "Invalid date format (use YYYY-MM-DD)"

    # Validate sleepTime (optional numeric field)
    if 'sleepTime' in data:
        sleep_time = data.get('sleepTime')
        if sleep_time is not None and not isinstance(sleep_time, (int, float)):
            return False, "sleepTime must be a number"
        if sleep_time is not None and (sleep_time < 0 or sleep_time > 24):
            return False, "sleepTime must be between 0 and 24 hours"

    # Validate mood (optional numeric 0-10)
    if 'mood' in data:
        mood = data.get('mood')
        if mood is not None and not isinstance(mood, int):
            return False, "mood must be an integer"
        if mood is not None and (mood < 0 or mood > 10):
            return False, "mood must be between 0 and 10"

    # Validate text fields (prevent excessively long entries)
    text_fields = ['notes', 'dreams', 'goals', 'gratitude']
    for field in text_fields:
        if field in data:
            value = data.get(field)
            if value is not None and not isinstance(value, str):
                return False, f"{field} must be text"
            if value and len(value) > 50000:  # 50KB limit per field
                return False, f"{field} exceeds maximum length"

    # Validate arrays
    if 'tags' in data:
        tags = data.get('tags')
        if tags is not None:
            if not isinstance(tags, list):
                return False, "tags must be an array"
            if len(tags) > 50:
                return False, "Too many tags (max 50)"
            for tag in tags:
                if not isinstance(tag, str) or len(tag) > 100:
                    return False, "Invalid tag format"

    return True, None

@app.route('/api/save', methods=['POST'])
@require_login
def save_entry():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    sanitized_data = sanitize_entry_data(data)
    if not sanitized_data or 'date' not in sanitized_data:
        app.logger.warning(f"Invalid entry data from user {session.get('user_id')}")
        return jsonify({"error": "Invalid entry data"}), 400

    date_key = sanitized_data['date']
    user_id = session.get('user_id')

    try:
        entry = JournalEntry.query.filter_by(user_id=user_id, date=date_key).first()

        if entry:
            entry.content = sanitized_data
        else:
            entry = JournalEntry(user_id=user_id, date=date_key, content=sanitized_data)
            db.session.add(entry)
        db.session.commit()
        app.logger.info(f"Entry saved: {date_key} for user {user_id}")
        return jsonify({"status": "success", "data": entry.to_dict()})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Write error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/delete/<date>', methods=['DELETE'])
@require_login
def delete_entry(date):
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    user_id = session.get('user_id')

    try:
        entry = JournalEntry.query.filter_by(user_id=user_id, date=date).first()
        if entry:
            db.session.delete(entry)
            db.session.commit()
            app.logger.info(f"Entry deleted: {date} for user {user_id}")
            return jsonify({"status": "deleted"})
        return jsonify({"status": "not found"}), 404
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Delete error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/settings', methods=['GET'])
@require_login
def get_settings():
    try:
        user_id = session.get('user_id')
        settings = Settings.query.filter_by(user_id=user_id).first()
        if settings:
            return jsonify(settings.data)
        return jsonify({})
    except Exception as e:
        app.logger.error(f"Settings read error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/settings', methods=['POST'])
@require_login
def save_settings():
    try:
        data = request.json
        user_id = session.get('user_id')

        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid settings data"}), 400

        if len(json.dumps(data)) > 100000:
            return jsonify({"error": "Settings data too large"}), 400

        settings = Settings.query.filter_by(user_id=user_id).first()

        if settings:
            settings.data = data
        else:
            settings = Settings(user_id=user_id, data=data)
            db.session.add(settings)

        db.session.commit()
        app.logger.info(f"Settings saved for user {user_id}")
        return jsonify({"status": "success"})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Settings save error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/export/json', methods=['GET'])
@require_login
def export_json():
    """Export all journal entries as JSON"""
    try:
        user_id = session.get('user_id')
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.date).all()
        data = {entry.date: entry.to_dict() for entry in entries}

        from flask import make_response
        response = make_response(json.dumps(data, indent=2, ensure_ascii=False))
        response.headers['Content-Type'] = 'application/json'
        response.headers['Content-Disposition'] = f'attachment; filename=journal_export_{datetime.now().strftime("%Y%m%d")}.json'

        app.logger.info(f"JSON export completed for user {user_id}")
        return response
    except Exception as e:
        app.logger.error(f"JSON export error: {e}")
        return jsonify({"error": "Export failed"}), 500

@app.route('/api/export/csv', methods=['GET'])
@require_login
def export_csv():
    """Export all journal entries as CSV"""
    try:
        user_id = session.get('user_id')
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.date).all()

        output = StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(['Date', 'Sleep Time', 'Mood', 'Notes', 'Dreams', 'Goals', 'Gratitude', 'Tags'])

        # Write data
        for entry in entries:
            data = entry.to_dict()
            writer.writerow([
                data.get('date', ''),
                data.get('sleepTime', ''),
                data.get('mood', ''),
                data.get('notes', ''),
                data.get('dreams', ''),
                data.get('goals', ''),
                data.get('gratitude', ''),
                ','.join(data.get('tags', []))
            ])

        from flask import make_response
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=journal_export_{datetime.now().strftime("%Y%m%d")}.csv'

        app.logger.info(f"CSV export completed for user {user_id}")
        return response
    except Exception as e:
        app.logger.error(f"CSV export error: {e}")
        return jsonify({"error": "Export failed"}), 500

@app.route('/api/export/pdf', methods=['GET'])
@require_login
def export_pdf():
    """Export all journal entries as PDF"""
    try:
        user_id = session.get('user_id')
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.date).all()

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()

        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#333333',
            spaceAfter=30
        )
        story.append(Paragraph("Journal Export", title_style))
        story.append(Spacer(1, 0.2*inch))

        # Add entries
        for entry in entries:
            data = entry.to_dict()

            # Date header
            date_style = ParagraphStyle(
                'DateHeader',
                parent=styles['Heading2'],
                fontSize=16,
                textColor='#0066cc',
                spaceAfter=12
            )
            story.append(Paragraph(f"<b>{data.get('date', 'Unknown')}</b>", date_style))

            # Entry details
            if data.get('sleepTime'):
                story.append(Paragraph(f"<b>Sleep:</b> {data['sleepTime']} hours", styles['Normal']))

            if data.get('mood'):
                story.append(Paragraph(f"<b>Mood:</b> {data['mood']}/5", styles['Normal']))

            if data.get('notes'):
                story.append(Paragraph(f"<b>Notes:</b> {escape(str(data['notes']))}", styles['Normal']))

            if data.get('dreams'):
                story.append(Paragraph(f"<b>Dreams:</b> {escape(str(data['dreams']))}", styles['Normal']))

            if data.get('goals'):
                story.append(Paragraph(f"<b>Goals:</b> {escape(str(data['goals']))}", styles['Normal']))

            if data.get('gratitude'):
                story.append(Paragraph(f"<b>Gratitude:</b> {escape(str(data['gratitude']))}", styles['Normal']))

            if data.get('tags'):
                story.append(Paragraph(f"<b>Tags:</b> {escape(', '.join(str(t) for t in data['tags']))}", styles['Normal']))

            story.append(Spacer(1, 0.3*inch))

        doc.build(story)
        buffer.seek(0)

        from flask import make_response
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=journal_export_{datetime.now().strftime("%Y%m%d")}.pdf'

        app.logger.info("PDF export completed")
        return response
    except Exception as e:
        app.logger.error(f"PDF export error: {e}")
        return jsonify({"error": "Export failed"}), 500

@app.route('/api/backup/create', methods=['POST'])
@require_login
def manual_backup():
    """Manually trigger a backup"""
    try:
        success = create_backup()
        if success:
            return jsonify({"status": "success", "message": "Backup created"})
        else:
            return jsonify({"error": "Backup failed"}), 500
    except Exception as e:
        app.logger.error(f"Manual backup error: {e}")
        return jsonify({"error": "Backup failed"}), 500

# ============================================================================
# USER MANAGEMENT ROUTES (Admin Only)
# ============================================================================

@app.route('/api/admin/users', methods=['GET'])
@require_admin
def list_users():
    """List all users (admin only)"""
    try:
        users = User.query.all()
        return jsonify({
            "users": [user.to_dict() for user in users],
            "total": len(users)
        })
    except Exception as e:
        app.logger.error(f"List users error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/admin/users', methods=['POST'])
@require_admin
def create_user():
    """Create a new user (admin only)"""
    try:
        data = request.json

        # Validate required fields
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Validate username length and format
        if len(username) < 3 or len(username) > 100:
            return jsonify({"error": "Username must be between 3 and 100 characters"}), 400

        # Validate password strength
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        # Check if username already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        # Check if email already exists (if provided)
        if email:
            existing_email = User.query.filter_by(email=email).first()
            if existing_email:
                return jsonify({"error": "Email already exists"}), 400

        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create new user
        new_user = User(
            username=username,
            password_hash=password_hash,
            email=email,
            is_admin=data.get('is_admin', False),
            is_active=data.get('is_active', True)
        )

        db.session.add(new_user)
        db.session.commit()

        app.logger.info(f"Admin {session.get('username')} created user {username} (ID: {new_user.id})")

        return jsonify({
            "status": "success",
            "message": "User created",
            "user": new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Create user error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user(user_id):
    """Get user details (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Include entry count
        entry_count = JournalEntry.query.filter_by(user_id=user.id).count()

        user_data = user.to_dict()
        user_data['entry_count'] = entry_count

        return jsonify(user_data)

    except Exception as e:
        app.logger.error(f"Get user error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    """Update user details (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json

        # Prevent admin from disabling themselves
        if user.id == session.get('user_id') and data.get('is_active') is False:
            return jsonify({"error": "Cannot disable your own account"}), 400

        # Prevent admin from removing their own admin status
        if user.id == session.get('user_id') and data.get('is_admin') is False:
            return jsonify({"error": "Cannot remove your own admin privileges"}), 400

        # Update username if provided
        if 'username' in data and data['username'] != user.username:
            # Check if new username already exists
            existing = User.query.filter_by(username=data['username']).first()
            if existing:
                return jsonify({"error": "Username already exists"}), 400
            user.username = data['username']

        # Update email if provided
        if 'email' in data and data['email'] != user.email:
            if data['email']:
                # Check if new email already exists
                existing = User.query.filter_by(email=data['email']).first()
                if existing and existing.id != user.id:
                    return jsonify({"error": "Email already exists"}), 400
            user.email = data['email']

        # Update password if provided
        if 'password' in data and data['password']:
            if len(data['password']) < 8:
                return jsonify({"error": "Password must be at least 8 characters"}), 400
            user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Update is_admin if provided
        if 'is_admin' in data:
            user.is_admin = bool(data['is_admin'])

        # Update is_active if provided
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])

        user.updated_at = datetime.utcnow()
        db.session.commit()

        app.logger.info(f"Admin {session.get('username')} updated user {user.username} (ID: {user.id})")

        return jsonify({
            "status": "success",
            "message": "User updated",
            "user": user.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Update user error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Delete a user and all their data (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Prevent admin from deleting themselves
        if user.id == session.get('user_id'):
            return jsonify({"error": "Cannot delete your own account"}), 400

        # Delete user (cascade will delete entries and settings)
        username = user.username
        db.session.delete(user)
        db.session.commit()

        app.logger.info(f"Admin {session.get('username')} deleted user {username} (ID: {user_id})")

        return jsonify({
            "status": "success",
            "message": f"User {username} and all associated data deleted"
        })

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Delete user error: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@require_admin
def reset_user_password(user_id):
    """Reset a user's password (admin only)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json
        new_password = data.get('password')

        if not new_password:
            return jsonify({"error": "New password is required"}), 400

        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400

        # Update password
        user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.updated_at = datetime.utcnow()
        db.session.commit()

        app.logger.info(f"Admin {session.get('username')} reset password for user {user.username} (ID: {user.id})")

        return jsonify({
            "status": "success",
            "message": f"Password reset for user {user.username}"
        })

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Reset password error: {e}")
        return jsonify({"error": "Server error"}), 500

if __name__ == '__main__':
    import os as _os

    # Debug mode enabled in development by default
    debug_mode = not IS_PRODUCTION

    # Only show startup message in the main process (not the reloader child)
    if _os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        print("\n" + "="*60)
        print("Journal App - Local Self-Hosted")
        print("="*60)
        print(f"Environment: {FLASK_ENV.upper()}")
        print(f"Username: {USERNAME}")

        # Check if using default password
        is_default_password = False
        try:
            is_default_password = bcrypt.checkpw('admin'.encode('utf-8'), PASSWORD_HASH.encode('utf-8'))
        except:
            pass

        print(f"Password: {'admin (DEFAULT!)' if is_default_password else '[custom]'}")
        print(f"Server: http://0.0.0.0:5000 (accessible on all interfaces)")
        print(f"Login via POST /api/login with username/password")

        if is_default_password:
            print(f"WARNING: Change default password in .env!")
            print(f"   Use hash_password.py to generate a bcrypt hash")

        if IS_PRODUCTION:
            print(f"INFO: Production mode - Auto-reload disabled, minimal logging")
            if is_default_password:
                print(f"CRITICAL: Using default password in PRODUCTION is a security risk!")
            if not os.getenv('SECRET_KEY'):
                print(f"WARNING: SECRET_KEY not set - sessions will reset on restart!")
        else:
            print(f"INFO: Development mode - Auto-reload enabled, debug logs active")

        print("="*60 + "\n")

    app.run(host='0.0.0.0', port=5000, debug=debug_mode, threaded=True)
