from flask import jsonify, render_template, request

from app.models import CampNotification, Camp
from . import user_bp
import json
from app.db_manager import CampManager, CampNotFound
from flask_login import login_required


@user_bp.route('/')
@user_bp.route('/index')
@login_required
def index():
    return render_template('user/index.html')

@user_bp.route('/camps')
@login_required
def camps():
    return render_template('user/camps.html')

@user_bp.route('/alerts')
@login_required
def alerts():
    return render_template('user/alerts.html')

@user_bp.route('/get_sensor_data')
@login_required
def get_sensor_data():
    with open('app/static/sensor_data.json') as file:
        data = json.load(file)
    return jsonify(data)

@user_bp.route('/donations')
@login_required
def donations():
    return render_template('user/donations.html')

@user_bp.route('/guide')
@login_required
def guide():
    return render_template('user/guide.html')

@user_bp.route('/volunteer')
@login_required
def volunteer():
    return render_template('user/volunteer.html')

@user_bp.route('/forums')
@login_required
def forums():
    return render_template('user/forums.html')

@user_bp.route('/get_camp_data/<int:cid>')
@login_required
def get_camp_data(cid):
    """
    Fetch data for a specific camp by its ID using CampManager.
    """
    camp_data = CampManager.get_camp_data(cid)
    if camp_data:
        return jsonify(camp_data)
    return jsonify({"error": "Camp not found"}), 404

@user_bp.route('/list_all_camps', methods=['GET','POST'])
@login_required
def list_all_camps():
    """
    Fetch a list of all camps using CampManager.
    """
    # sort_by = request.sort_by.data()
    camps = CampManager.list_all_camps()
    return jsonify(camps)


@user_bp.route('/camp_notification/<int:camp_id>', methods=['GET'])
def get_announcements(camp_id):
    camp = Camp.query.get_or_404(camp_id)
    announcements = CampNotification.query.filter_by(camp_id=camp_id).order_by(CampNotification.timestamp.desc()).all()

    announcements_list = [
        {
            "id": a.aid,
            "message": a.message,
            "timestamp": a.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        }
        for a in announcements
    ]

    return jsonify(announcements_list)







##errors
@user_bp.errorhandler(CampNotFound)
@login_required
def handle_camp_not_found(error):
    """
    Global error handler for CampNotFound exceptions.
    """
    return jsonify({"error": str(error)}), 404

