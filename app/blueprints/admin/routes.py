from flask import render_template
from flask_login import login_required
from . import admin_bp

@admin_bp.route('/index')
def index():
    return render_template('admin/index.html')

@admin_bp.route('/camps')
@login_required
def camps():
    return render_template('admin/camps.html')
