from flask import render_template
from . import local_auth_bp

@local_auth_bp.route('/')
def index():
    return render_template('local_auth/index.html')
