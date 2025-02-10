from flask import render_template
from . import local_auth_bp

@local_auth_bp.route('/reports')
def reports():
    return render_template('local_authorities_reports.html')
