from flask import render_template
from flask_login import login_required
from . import warehouse_bp

@warehouse_bp.route('/')
@login_required
def index():
    return render_template('warehouse_manager/index.html')
