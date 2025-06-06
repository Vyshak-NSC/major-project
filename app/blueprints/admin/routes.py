from flask import render_template, request, jsonify, flash
from flask_login import login_required
from app.db_manager import get_table_count
from app.data import load_sensor_configs, save_sensor_configs, generate_sensor_data, save_sensor_data_to_json
from . import admin_bp
from .admin_api import *
import json
import os


@admin_bp.route('/index')
def index():
    table_count_list = get_table_count()
    return render_template('admin/index.html', table_count_list=table_count_list)

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

@admin_bp.route('/sensor')
@login_required
def sensor():
    try:
        # Load sensor configs
        sensor_configs = load_sensor_configs()
        
        # Load sensor data to get status information
        try:
            with open(os.path.join('app', 'static', 'data', 'sensor_data.json'), 'r') as f:
                sensor_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            sensor_data = []
        
        # Combine configs with their current status
        sensors_with_status = []
        for config in sensor_configs:
            sensor_info = config.copy()
            # Find matching sensor data
            matching_data = next((data for data in sensor_data if data['id'] == config['id']), None)
            sensor_info['status'] = matching_data['status'] if matching_data else 'Initializing'
            sensors_with_status.append(sensor_info)
        
        return render_template('admin/sensor.html', sensors=sensors_with_status)
    except Exception as e:
        flash(f"Error loading sensors: {str(e)}", "error")
        return render_template('admin/sensor.html', sensors=[])

@admin_bp.route('/add_sensor', methods=['POST'])
@login_required
def add_sensor():
    try:
        # Get form data
        sensor_name = request.form.get('sensor_name')
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        soil_type = request.form.get('soil_type')

        if not all([sensor_name, latitude, longitude, soil_type]):
            return jsonify({'success': False, 'message': 'All fields are required'})

        # Load existing sensor configs
        sensor_configs = load_sensor_configs()
        
        # Generate new sensor ID
        new_id = len(sensor_configs) + 1
        
        # Create new sensor config
        new_sensor = {
            'id': new_id,
            'name': sensor_name,
            'latitude': latitude,
            'longitude': longitude,
            'soil_type': soil_type
        }
        
        # Add new sensor to configs
        sensor_configs.append(new_sensor)
        
        # Save updated configs
        save_sensor_configs(sensor_configs)
        
        # Generate initial sensor data
        sensor_data = generate_sensor_data(new_sensor)
        
        # Load existing sensor data
        existing_data = []
        try:
            with open(os.path.join('app', 'static', 'data', 'sensor_data.json'), 'r') as f:
                existing_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        
        # Add new sensor data
        existing_data.append(sensor_data)
        
        # Save updated sensor data
        save_sensor_data_to_json(existing_data)
        
        return jsonify({'success': True, 'message': 'Sensor added successfully'})
        
    except ValueError as e:
        return jsonify({'success': False, 'message': 'Invalid input values'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@admin_bp.route('/delete_sensor/<int:sensor_id>', methods=['POST'])
@login_required
def delete_sensor(sensor_id):
    try:
        # Load existing sensor configs
        sensor_configs = load_sensor_configs()
        
        # Find and remove the sensor
        sensor_configs = [s for s in sensor_configs if s['id'] != sensor_id]
        
        # Save updated configs
        save_sensor_configs(sensor_configs)
        
        # Load existing sensor data
        try:
            with open(os.path.join('app', 'static', 'data', 'sensor_data.json'), 'r') as f:
                sensor_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            sensor_data = []
        
        # Remove data for deleted sensor
        sensor_data = [s for s in sensor_data if s['id'] != sensor_id]
        
        # Save updated sensor data
        save_sensor_data_to_json(sensor_data)
        
        return jsonify({'success': True, 'message': 'Sensor deleted successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@admin_bp.route('/get_sensors')
@login_required
def get_sensors():
    try:
        sensors = load_sensor_configs()
        return jsonify(sensors)
    except Exception as e:
        return jsonify({'error': str(e)}), 500





# @admin_bp.route('/get_all_users')
# @login_required
# def get_all_users():
#     """
#     List all user
#     """
#     try:
#         # Use CampManager to fetch all users
#         users = UserManager.list_all_users()

#         # Return the list of users as JSON
#         return jsonify(users), 200
#     except Exception as e:
#         # Handle any unexpected errors
#         return jsonify({"error": str(e)}), 500


# @admin_bp.route('/add_user', methods=['GET', 'POST'])
# @login_required
# def add_user():
#     """
#     Add a new user (Admin functionality).
#     """
#     try:
#         # Extract form data
#         email    = 'test@gmail.com' #request.values.get('email')
#         username = 'test' #request.values.get('username','user')
#         password = 'test' #request.values.get('password')
#         role     = 'test' #request.values.get('role')
        
#         # Add the user using UserManager
#         response, status_code = UserManager.add_user(
#             username=username,
#             email=email,
#             password=password,
#             role=role
#         )

#         if status_code == 201:  # Successfully added
#             print('\n\n\nsuccess')
#             # return redirect(url_for('admin.index'))
#             return jsonify({'mesgae':'success'})
#         else:
#             flash(response.get("error", "Failed to add user."), "danger")
#             return {'error':'Failed to add user'}

#     except Exception as e:
#         print('\n\n\n\n\nerror',e)
#         # return redirect(url_for('admin.index'))
#         return jsonify({'error':'Failed'})

#     # GET request: Render the add user form
#     return redirect(url_for('admin.index'))

# @admin_bp.route('/edit_user/<int:uid>', methods=['GET','POST'])
# def edit_user(uid):
#     username = request.form.get('username')
#     email = request.form.get('email')
#     location = request.form.get('location')
#     mobile = request.form.get('mobile')
#     role = request.form.get('role')
    
#     update_data = {}
#     if username:
#         update_data['username'] = username
#     if email:
#         existing_user = User.query.filter_by(email=email).first()
#         if existing_user and existing_user.uid != uid:
#             return redirect(url_for('admin_bp.edit_user', uid=uid))
#         update_data['email'] = email
#     if location:
#         update_data['location'] = location
#     if mobile:
#         update_data['mobile'] = mobile
#     if role:
#         update_data['role'] = role

#     updated_user = UserManager.update_user(uid, **update_data)



# @admin_bp.route('/delete_user/<int:uid>', methods=['POST','DELETE'])
# @login_required
# def delete_user(uid):
#     """
#     Delete a user by their ID.
#     """
#     deleted = UserManager.delete_user(uid)
#     if deleted:
#         flash("User deleted successfully!", "success")
#         return jsonify({'message':f'user {uid} deleted'})
#     else:
#         flash("Failed to delete user.", "danger")
#         return jsonify({'message':f'deletion failed'})
        
#     # return redirect(url_for('admin_bp.list_users'))
    






# @admin_bp.route('/get_all_camps')
# @login_required
# def get_all_camps():
#     """
#     List all camp info
#     """
    
#     try:
#         # Use CampManager to fetch all camps
#         camps = CampManager.list_all_camps()

#         # Return the list of camps as JSON
#         return jsonify(camps), 200
#     except Exception as e:
#         # Handle any unexpected errors
#         return jsonify({"error": str(e)}), 500


# @admin_bp.route('/add_camp', methods=['GET','POST'])
# @login_required
# def add_camp():
#     camp_name = 'name'
#     location = 'location'
#     status = 'status'
#     capacity = 'capacity'
#     num_people = 'num_people'
#     food_stock = 'food_stock'
#     water_stock = 'water_stock'
#     contact_number = 'contact_no'
#     lat = 10.2
#     lng = 15.445
    
#     newcamp = CampManager.create_camp(
#         camp_name=camp_name,
#         location=location,
#         coordinates_lat=lat,
#         coordinates_lng=lng,
#         capacity=capacity,
#         contact_number=contact_number,
#         status=status
#     )
    
#     return jsonify({'message':'camp created'})

# # @admin_bp.route('')