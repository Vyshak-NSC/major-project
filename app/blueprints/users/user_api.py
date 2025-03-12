from . import user_bp
from .utils import VolunteerForm
from flask import jsonify, request
from json import load as load_json
from app.models import Camp, CampNotification
from flask_login import current_user, login_required
from app.db_manager import CampManager, ForumManager, VolunteerManager

@user_bp.route('/get_sensor_data')
@login_required
def get_sensor_data():
    with open('app/static/sensor_data.json') as file:
        data = load_json.load(file)
    return jsonify(data)

@user_bp.route('/submit_volunteer', methods=['POST', 'GET'])
def submit_volunteer():
    form = VolunteerForm(request.form)
    if form.validate():
            response, status_code = VolunteerManager.add_volunteer(
                name=form.name.data,
                email=form.email.data,
                mobile=form.mobile.data,
                location=form.location.data,
                role_id=form.role_id.data
            )
            return response, status_code
    else:
        return jsonify({"error": "Invalid form data"}), 400

################## Camps APIs ##################

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


@user_bp.route('/list_all_camps', methods=['GET', 'POST'])
@login_required
def list_all_camps():
    """
    Fetch a list of all camps using CampManager.
    """
    camps = CampManager.list_all_camps()
    return jsonify(camps)


@user_bp.route('/camp_notification/<int:camp_id>', methods=['GET'])
def get_announcements(camp_id):
    """
    Fetch announcements for a specific camp.
    """
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




################## Forum APIs ##################

@user_bp.route('/forums/get_threads', methods=['GET'])
@login_required
def get_threads():
    """
    Retrieve all forum threads.
    """
    threads = ForumManager.get_all_threads()
    return jsonify(threads)

@user_bp.route('/forums/get_thread/<int:thread_id>', methods=['GET'])
@login_required
def get_thread(thread_id):
    """
    Retrieve all forum threads.
    """
    threads = ForumManager.get_replies_for_thread(thread_id)
    return jsonify(threads)


@user_bp.route('/forums/add_thread', methods=['GET', 'POST'])
@login_required
def add_thread():
    title = request.values.get('title')
    content = request.values.get('content')
    ForumManager.create_thread(current_user.uid, title, content)
    return jsonify({"status": "success"}), 201

@user_bp.route('/forums/replies/<int:thread_id>', methods=['GET'])
@login_required
def get_replies(thread_id):
    """
    Retrieve all replies for a specific thread.
    """
    replies = ForumManager.get_replies_for_thread(thread_id)
    return jsonify(replies)

@user_bp.route('/forums/add_reply', methods=['POST'])
@login_required
def add_reply():
    """
    Add a reply to a forum thread.
    """
    thread_id = request.form.get('thread_id')
    content = request.form.get('content')
    print('\n\n\n\n\n\nval:',thread_id, content)
    result = ForumManager.create_reply(current_user.uid, thread_id, content)
    return jsonify(result), 201


################## Volunteer APIs ##################

@user_bp.route('/volunteer/get_volunteer_data', methods=['GET'])
@login_required
def get_volunteer_data():
    """
    Fetch data for a specific volunteer.
    """
    volunteer_data = VolunteerManager.get_volunteer_history(current_user.uid)
    return jsonify(volunteer_data)