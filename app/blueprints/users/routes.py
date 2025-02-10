from flask import jsonify, render_template
from . import user_bp
import json, sys, os

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