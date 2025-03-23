from flask import flash, jsonify, redirect, request, url_for
from flask_login import current_user, login_required
from app.db_manager import UserManager, CampManager, get_user_activity, log_recent_activity
from app.models import User
from . import admin_bp
from app.extensions import db

################## User Management APIs ##################

@admin_bp.route('/get_all_users')
@login_required
def get_all_users():
    """
    List all users.
    """
    try:
        users = UserManager.list_all_users()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/get_user/<int:user_id>')
@login_required
def get_user(user_id):
    """
    List all users.
    """
    try:
        users = UserManager.get_user(user_id)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/get_user_activity/<int:uid>')
@login_required
def user_activity(uid):
    data = get_user_activity(uid)
    
    return jsonify(data)

@admin_bp.route("/add_user", methods=["POST"])
@login_required
def add_user():
    try:
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        location = data.get("location")
        mobile = data.get("mobile")
        role = data.get("role")
        associated_camp_id = data.get("associated_camp_id")

        if not all([username, email, password, role]):  
            return jsonify({"error": "Username, email, password, and role are required"}), 400
        
        response, status_code = UserManager.create_user(username, email, password, location, mobile, role, associated_camp_id)

        return jsonify(response), status_code  # Return the correct response and status code

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@admin_bp.route('/update_user/<int:uid>', methods=['PUT'])
@login_required
def update_user(uid):
    """
    Edit user details.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Remove empty fields
        update_data = {key: value for key, value in data.items() if value is not None}

        # Check if email is already in use
        if 'email' in update_data:
            existing_user = User.query.filter_by(email=update_data['email']).first()
            if existing_user and existing_user.uid != uid:
                return jsonify({'error': 'Email already in use'}), 400

        # Update user
        updated_user, status_code = UserManager.update_user(uid, **update_data)
        return jsonify({'message': 'User updated successfully', 'user': updated_user}), status_code

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/delete_user/<int:uid>', methods=['DELETE'])
@login_required
def delete_user(uid):
    """
    Delete a user by their ID.
    """
    try:
        deleted = UserManager.delete_user(uid)
        if deleted:
            log_recent_activity(user_id=current_user.uid, action=f"Deleted user with ID: {uid}")
            return jsonify({'message': f'User {uid} deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete user'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

################## Camp Management APIs ##################

@admin_bp.route('/get_all_camps')
@login_required
def get_all_camps():
    """
    List all camps.
    """
    try:
        camps = CampManager.list_all_camps()
        return jsonify(camps), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/get_camp_data/<int:camp_id>')
def get_camp_data(camp_id):
    """
    Return camp details
    """
    try:
        camp = CampManager.get_camp_data(camp_id)
        return jsonify(camp), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@admin_bp.route('/create_camp', methods=['POST'])
@login_required
def create_camp():
    """
    Add a new camp.
    """
    try:
        data = request.get_json()
        print("Received Data:", data)  # Debugging

        # Ensure required fields are present
        required_fields = ['camp_name', 'location', 'lat', 'lng', 'camp_capacity', 'contact_number']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing or invalid field: {field}'}), 400

        # Convert lat/lng to float (if needed)
        lat = float(data['lat'])
        lng = float(data['lng'])

        # Ensure capacity is an integer
        capacity = int(data['camp_capacity'])

        # Create the camp
        new_camp = CampManager.create_camp(
            camp_name=data['camp_name'],
            location=data['location'],
            coordinates_lat=lat,
            coordinates_lng=lng,
            capacity=capacity,
            contact_number=data['contact_number']
        )

        # Log recent activity
        log_recent_activity(user_id=current_user.uid, action=f"Added camp: {data['camp_name']}")

        return jsonify({'message': 'Camp created successfully', 'camp_id': new_camp.cid}), 201

    except ValueError as ve:
        return jsonify({'error': f'Value error: {str(ve)}'}), 400
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {e}'}), 500
    
    
@admin_bp.route('/update_camp_data/<int:camp_id>', methods=['PUT'])
def update_camp_data(camp_id):
    """
    Updaet camp data.
    """
    try:
        # Parse JSON data from the request
        data = request.get_json()

        # Extract coordinates and split them into lat/lng
        if 'coordinates' in data:
            coordinates = data.pop('coordinates')
            data['coordinates_lat'] = coordinates[0]
            data['coordinates_lng'] = coordinates[1]

        # Remove unwanted fields (e.g., cid)
        data.pop('cid', None)

        # Call the update_camp_data method from CampManager
        updated_camp = CampManager.update_camp_data(cid=camp_id, **data)

        if updated_camp:
            # Log the activity
            log_recent_activity(user_id=current_user.uid, action=f"Updated camp: {data.get('camp_name')}")

            # Serialize the updated camp object for the response
            return jsonify({'message': 'Camp updated successfully'}), 200
        else:
            return jsonify({'error': 'Camp not found'}), 404

    except Exception as e:
        # Print the full traceback for debugging
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500



@admin_bp.route('/delete-camp/<int:camp_id>',methods=['DELETE'])
def delete_camp(camp_id):   
    deleted = CampManager.delete_camp(camp_id)
    if deleted:
        return jsonify({'message':f'Camp of id:{camp_id} deleted successfully'})
    else:
        return jsonify({'error':'Camp deletion failed'})