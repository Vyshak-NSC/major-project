from flask import Flask, redirect, url_for
from flask_login import login_required

from app.models import User
from .config import Config

from .extensions import db, migrate, login_manager, bcrypt

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


# Factory function
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = "danger"


    # Register Blueprints
    from app.blueprints.users import user_bp
    from app.blueprints.admin import admin_bp
    from app.blueprints.auth import auth_bp
    from app.blueprints.local_auth import local_auth_bp
    from app.blueprints.warehouse_manager import warehouse_bp
    
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(local_auth_bp)
    app.register_blueprint(warehouse_bp)
    
    
    @app.route('/')
    @app.route('/index')
    @login_required
    def index():
        return redirect(url_for('user.index'))
    
    @app.route("/site-map")
    def site_map():
        links = []
        for rule in app.url_map.iter_rules():
            # Filter out rules we can't navigate to in a browser
            # and rules that require parameters
            if "GET" in rule.methods and has_no_empty_params(rule):
                url = url_for(rule.endpoint, **(rule.defaults or {}))
                links.append((url, rule.endpoint))
        return '<br>'.join(['<a href="{url}">{endpoint}</a>'.format(url=url, endpoint=endpoint) for url, endpoint in links])
    
    return app
