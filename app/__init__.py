from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

from app.models import User
from .config import Config

from .extensions import db, migrate, login_manager, bcrypt

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Factory function
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    # login_manager.init_app(app)
    # login_manager.login_view = 'users.login'

    # Register Blueprints
    from app.blueprints.users import user_bp
    from app.blueprints.admin import admin_bp
    from app.blueprints.local_auth import local_auth_bp
    
    app.register_blueprint(user_bp)
    # app.register_blueprint(admin_bp)
    # app.register_blueprint(local_auth_bp)
    
    return app
