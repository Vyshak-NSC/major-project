from flask import jsonify, render_template, request
from . import user_bp
import json
from app.db_manager import CampManager, CampNotFound

@user_bp.route('/')
def index():
    return render_template('user/index.html')

@user_bp.route('/login')
def login():
    return render_template('auth/login.html')

@user_bp.route('/camps')
def camps():
    return render_template('user/camps.html')

@user_bp.route('/alerts')
def alerts():
    return render_template('user/alerts.html')

@user_bp.route('/get_sensor_data')
def get_sensor_data():
    with open('app/static/sensor_data.json') as file:
        data = json.load(file)
    return jsonify(data)

@user_bp.route('/donations')
def donations():
    return render_template('user/donations.html')

@user_bp.route('/guide')
def guide():
    return render_template('user/guide.html')

@user_bp.route('/volunteer')
def volunteer():
    return render_template('user/volunteer.html')

@user_bp.route('/forums')
def forums():
    return render_template('user/forums.html')

@user_bp.route('/get_camp_data/<int:cid>')
def get_camp_data(cid):
    """
    Fetch data for a specific camp by its ID using CampManager.
    """
    camp_data = CampManager.get_camp_data(cid)
    if camp_data:
        return jsonify(camp_data)
    return jsonify({"error": "Camp not found"}), 404

@user_bp.route('/list_all_camps')
def list_all_camps():
    """
    Fetch a list of all camps using CampManager.
    """
    camps = CampManager.list_all_camps()
    return jsonify(camps)

##errors
@user_bp.errorhandler(CampNotFound)
def handle_camp_not_found(error):
    """
    Global error handler for CampNotFound exceptions.
    """
    return jsonify({"error": str(error)}), 404