from flask import flash, jsonify, redirect, request, url_for
from flask_login import current_user, login_required
from app.db_manager import UserManager, CampManager, get_user_activity, log_recent_activity
from app.models import User
from . import admin_bp

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


@admin_bp.route('/get_user_activity/<int:uid>')
def user_activity(uid):
    data = get_user_activity(uid)
    
    return jsonify(data)

@admin_bp.route('/add_user', methods=['POST'])
def add_user():
    """
    Add a new user (Admin functionality).
    """
    

@admin_bp.route('/edit_user/<int:uid>', methods=['POST'])
@login_required
def edit_user(uid):
    """
    Edit user details.
    """
    try:
        data = request.get_json()
        update_data = {key: value for key, value in data.items() if value}

        if 'email' in update_data:
            existing_user = User.query.filter_by(email=update_data['email']).first()
            if existing_user and existing_user.uid != uid:
                return jsonify({'error': 'Email already in use'}), 400

        updated_user = UserManager.update_user(uid, **update_data)
        return jsonify({'message': 'User updated successfully', 'user': updated_user}), 200
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


@admin_bp.route('/add_camp', methods=['POST'])
@login_required
def add_camp():
    """
    Add a new camp.
    """
    try:
        data = request.get_json()
        new_camp = CampManager.create_camp(
            camp_name=data.get('camp_name'),
            location=data.get('location'),
            coordinates_lat=data.get('lat'),
            coordinates_lng=data.get('lng'),
            capacity=data.get('capacity'),
            contact_number=data.get('contact_number'),
            status=data.get('status')
        )
        if new_camp:
            log_recent_activity(user_id=current_user.uid, action=f"Added camp: {data.get('camp_name')}")
            return jsonify({'message': 'Camp created successfully', 'camp': new_camp}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
