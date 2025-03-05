from werkzeug.security import generate_password_hash
from flask import flash, jsonify, redirect, render_template, request, url_for
from flask_login import login_required

from app.db_manager import CampManager, UserManager
from app.models import User
from . import admin_bp

@admin_bp.route('/index')
def index():
    return render_template('admin/index.html')

@admin_bp.route('/camps')
@login_required
def camps():
    return render_template('admin/camps.html')

@admin_bp.route('/warehouse')
@login_required
def warehouse():
    return render_template('admin/warehouse.html')

@admin_bp.route('/users')
@login_required
def users():
    return render_template('admin/user.html')






@admin_bp.route('/get_all_users')
@login_required
def get_all_users():
    """
    List all user
    """
    try:
        # Use CampManager to fetch all users
        users = UserManager.list_all_users()

        # Return the list of users as JSON
        return jsonify(users), 200
    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/add_user', methods=['GET', 'POST'])
@login_required
def add_user():
    """
    Add a new user (Admin functionality).
    """
    try:
        # Extract form data
        email    = 'test@gmail.com' #request.values.get('email')
        username = 'test' #request.values.get('username','user')
        password = 'test' #request.values.get('password')
        role     = 'test' #request.values.get('role')
        
        # Add the user using UserManager
        response, status_code = UserManager.add_user(
            username=username,
            email=email,
            password=password,
            role=role
        )

        if status_code == 201:  # Successfully added
            print('\n\n\nsuccess')
            # return redirect(url_for('admin.index'))
            return jsonify({'mesgae':'success'})
        else:
            flash(response.get("error", "Failed to add user."), "danger")
            return {'error':'Failed to add user'}

    except Exception as e:
        print('\n\n\n\n\nerror',e)
        # return redirect(url_for('admin.index'))
        return jsonify({'error':'Failed'})

    # GET request: Render the add user form
    return redirect(url_for('admin.index'))

@admin_bp.route('/edit_user/<int:uid>', methods=['GET','POST'])
def edit_user(uid):
    username = request.form.get('username')
    email = request.form.get('email')
    location = request.form.get('location')
    mobile = request.form.get('mobile')
    role = request.form.get('role')
    
    update_data = {}
    if username:
        update_data['username'] = username
    if email:
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.uid != uid:
            return redirect(url_for('admin_bp.edit_user', uid=uid))
        update_data['email'] = email
    if location:
        update_data['location'] = location
    if mobile:
        update_data['mobile'] = mobile
    if role:
        update_data['role'] = role

    updated_user = UserManager.update_user(uid, **update_data)



@admin_bp.route('/delete_user/<int:uid>', methods=['POST','DELETE'])
@login_required
def delete_user(uid):
    """
    Delete a user by their ID.
    """
    deleted = UserManager.delete_user(uid)
    if deleted:
        flash("User deleted successfully!", "success")
        return jsonify({'message':f'user {uid} deleted'})
    else:
        flash("Failed to delete user.", "danger")
        return jsonify({'message':f'deletion failed'})
        
    # return redirect(url_for('admin_bp.list_users'))
    






@admin_bp.route('/get_all_camps')
@login_required
def get_all_camps():
    """
    List all camp info
    """
    
    try:
        # Use CampManager to fetch all camps
        camps = CampManager.list_all_camps()

        # Return the list of camps as JSON
        return jsonify(camps), 200
    except Exception as e:
        # Handle any unexpected errors
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/add_camp', methods=['GET','POST'])
@login_required
def add_camp():
    camp_name = 'name'
    location = 'location'
    status = 'status'
    capacity = 'capacity'
    num_people = 'num_people'
    food_stock = 'food_stock'
    water_stock = 'water_stock'
    contact_number = 'contact_no'
    lat = 10.2
    lng = 15.445
    
    newcamp = CampManager.create_camp(
        camp_name=camp_name,
        location=location,
        coordinates_lat=lat,
        coordinates_lng=lng,
        capacity=capacity,
        contact_number=contact_number,
        status=status
    )
    
    return jsonify({'message':'camp created'})

# @admin_bp.route('')