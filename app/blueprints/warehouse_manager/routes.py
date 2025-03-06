from flask import render_template
from . import warehouse_bp

@warehouse_bp.route('/')
def index():
    return render_template('warehouse_manager/index.html')
