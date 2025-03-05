from flask import jsonify, redirect, render_template, request, url_for

from app.models import CampNotification, Camp
from . import user_bp
import json
from app.db_manager import CampManager, CampNotFound, VolunteerManager
from flask_login import current_user, login_required


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
    user = current_user
    return render_template('user/volunteer.html', user = user)

@user_bp.route('/submit_volunteer', methods=['POST','GET'])
def submit_volunteer():
    """
    Handle the form submission for adding a new volunteer.
    """
    try:
        # Extract form data
        name = request.form.get('name')
        email = request.form.get('email')
        mobile = request.form.get('mobile')
        location = request.form.get('location')
        role_id = request.form.get('role_id')

        # Validate required fields
        # if not name or not email or not role_id:
        print('\n\n\n\n\n\n\n',name,email,role_id,location,mobile)
        #     return redirect(url_for('user.volunteer'))  # Redirect back to the form page

        # Add the volunteer using VolunteerManager
        response, status_code = VolunteerManager.add_volunteer(
            name=name,
            email=email,
            mobile=mobile,
            location=location,
            role_id=role_id
        )

        return redirect(url_for('user.volunteer'))
    
    except Exception as e:
        return redirect(url_for('user.alerts'))

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

