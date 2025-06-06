from . import user_bp
from .utils import VolunteerForm
from flask import jsonify, request
from json import load as load_json
from app.models import Camp, CampNotification, Donation
from flask_login import current_user, login_required
from app.db_manager import CampManager, DonationManager, ForumManager, VolunteerManager
import razorpay

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=("YOUR_RAZORPAY_KEY_ID", "YOUR_RAZORPAY_KEY_SECRET"))



@user_bp.route('/get_sensor_data')
def get_sensor_data():
    with open('app/static/sensor_data.json') as file:
        data = load_json(file)
    return jsonify(data)

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


@user_bp.route('/list_all_camps', methods=['GET'])
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

@user_bp.route('/people-list/<int:camp_id>', methods=['GET'])
@login_required
def get_people_list(camp_id):
    """
    Fetch the list of people in a specific camp.
    """
    camp = Camp.query.get(camp_id)

    if not camp:
        return jsonify({"error": "Camp not found"}), 404

    # Convert the camp object to a JSON-serializable format
    people_list = camp.people_list or []
    return jsonify(people_list),201

@user_bp.route('/add_person_to_camp/<int:camp_id>', methods=['POST'])
@login_required
def add_person_to_camp(camp_id):
    """
    Add a person to the camp's people_list.
    """
    camp = Camp.query.get(camp_id)
    if not camp:
        return jsonify({"error": "Camp not found"}), 404

    data = request.get_json()
    user_id = data.get('uid')
    name = data.get('name')

    if not user_id or not name:
        return jsonify({"error": "Invalid data. 'uid' and 'name' are required."}), 400

    # Add the person to the camp's people_list
    if not camp.people_list:
        camp.people_list = []
    camp.people_list.append({'uid': user_id, 'name': name})

    # Save changes to the database
    CampManager.update_camp(camp)

    return jsonify({"status": "success", "message": "Person added to camp successfully"}), 200

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
@user_bp.route('/submit_volunteer', methods=['POST'])
@login_required
def submit_volunteer():
    """
    Submit volunteer form data.
    """
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    location = data.get('location')
    role_id = data.get('role_id')
    
    # Submit volunteer using your manager class
    result = VolunteerManager.add_volunteer(name, email, mobile, location, role_id, current_user.uid)
    if result:
        return {"status": "success", "message": "Volunteer submitted successfully"}, 201
    return {"status": "error", "errors": "Error submitting volunteer"}, 400

@user_bp.route('/volunteer/get_volunteer_history/<int:user_id>', methods=['GET'])
@login_required
def get_volunteer_history(user_id):
    """
    Fetch data for a specific volunteer.
    """
    history_records = VolunteerManager.get_volunteer_history(user_id)
    
    if not history_records:
        return jsonify({"status": "error", "message": "Volunteer record not found for this user."}), 404
    
    return jsonify({"status": "success", "volunteer_history": history_records}), 200


################## Donation APIs ##################

# donate amount
@user_bp.route('/donate_amount', methods=['POST'])
def donate_amount():
    """
    Donate an amount to the organization.
    """
    data = request.get_json()
    amount = data.get('amount')
    if not amount:
        return jsonify({"success": False, "error": "Invalid or missing amount data"}), 400

    # Save the donation using the DonationManager
    result = DonationManager.add_donation(user_id=current_user.uid, amount=amount)
    # Return a success response
    return jsonify({"success": True, "message": result["message"], "donation_id": result["donation_id"]}), 200

@user_bp.route('/donate_items', methods=['POST'])
def donate_items():
        # Parse the JSON data from the request
        data = request.get_json()
        items = data.get('items')

        if not items or not isinstance(items, list):
            return jsonify({"success": False, "error": "Invalid or missing items data"}), 400

        # Ensure all items have the required fields
        for item in items:
            if not all(key in item for key in ['name', 'quantity', 'condition']):
                return jsonify({"success": False, "error": "Each item must include 'name', 'quantity', and 'condition'"}), 400

        # Save the donation using the DonationManager
        result = DonationManager.add_donation(user_id=current_user.uid, items=items)
        # Return a success response
        return jsonify({"success": True, "message": result["message"], "donation_id": result["donation_id"]}), 200

# get donation
@user_bp.route('/get_all_donation', methods=['GET'])
def get_donation():
    """
    Retrieve all donations.
    """
    donations = DonationManager.list_all_donations()
    return jsonify(donations)

# get doantion by user id
@user_bp.route('/get_donation_by_user/<int:user_id>', methods=['GET'])
def get_donation_by_user(user_id):
    """
    Retrieve all donations by user.
    """
    donations = DonationManager.get_donation_by_user(user_id)
    return jsonify(donations)

@user_bp.route('/payment-success', methods=['POST'])
def payment_success():
    # Parse the payment response
    data = request.get_json()
    payment_id = data.get('razorpay_payment_id')
    order_id = data.get('razorpay_order_id')
    signature = data.get('razorpay_signature')

    # Verify the payment using Razorpay's API
    params_dict = {
        'razorpay_payment_id': payment_id,
        'razorpay_order_id': order_id,
        'razorpay_signature': signature
    }
    verification = razorpay_client.utility.verify_payment_signature(params_dict)

    if verification:
        # Payment is successful
        payment_details = razorpay_client.payment.fetch(payment_id)
        amount_paid = payment_details['amount'] / 100  # Amount in INR (convert from paise)
        currency = payment_details['currency']
        status = payment_details['status']

        # Save the payment details to your database
        user_id = 1  # Replace with actual user ID logic
        DonationManager.add_donation(user_id=user_id, amount=amount_paid)

        return jsonify({"success": True, "message": "Payment successful", "amount_paid": amount_paid})
    else:
        # Payment verification failed
        return jsonify({"success": False, "error": "Payment verification failed"}), 400

@user_bp.route('/user-donation-summary', methods=['GET'])
@login_required
def get_user_donation_summary():
    amount_donated = DonationManager.get_donation_amount_by_user(current_user.uid)
    items_donated = DonationManager.get_donation_by_user(current_user.uid)

    return jsonify({"amount_donated": amount_donated, "items_donated": items_donated})

# get overall donations funtion
@user_bp.route('/donation-summary')
@login_required
def get_donation_summary():
    amount_donated = DonationManager.get_total_donated_amount()  # Fetch total donation amount from the database
    items_donated = DonationManager.get_total_donated_items()
    
    return jsonify({"amount_donated": amount_donated, "items_donated": items_donated})
