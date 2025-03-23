from flask import render_template
from . import local_auth_bp
from flask_login import login_required

@local_auth_bp.route('/')
@login_required
def index():
    return render_template('local_auth/index.html')
