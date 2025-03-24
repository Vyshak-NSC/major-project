from flask import Blueprint, render_template, redirect, session, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from app.extensions import db, bcrypt
from app.models import User
from . import auth_bp
from werkzeug.security import generate_password_hash

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        #  user login
        if user and user.check_password(password) and user.role == 'user':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('user.index'))
        
        #  admin login
        elif user and user.check_password(password) and user.role == 'admin':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('admin.index'))
        
        # camp head login
        elif user and user.check_password(password) and user.role == 'local_auth':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('local_auth.index'))
        
        # local auth login
        elif user and user.check_password(password) and user.role == 'camp_manager':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('camp_manager.index'))
        
        # warehouse manager login
        elif user and user.check_password(password) and user.role == 'warehouse_manager':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('warehouse_manager.index'))
        
        
        else:
            flash('Invalid email or password', 'danger')
            redirect(url_for('auth.login'))
    return render_template('auth/login.html'),201

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email    = request.values.get('email')
        username = request.values.get('username','user')
        password = request.values.get('password')

        user = User(username=username, email=email, role='user')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect(url_for('user.index'))
    return redirect(url_for('auth.login'))


@auth_bp.route('/admin_register', methods=['GET', 'POST'])
def adminregister():
    if request.method == 'POST':
        email    = request.values.get('email')
        username = request.values.get('username','admin')
        password = request.values.get('password')

        user = User(username=username, email=email, role='admin')
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('Account created! You can now log in.', 'success')
        return redirect(url_for('admin.index'))
    return redirect(url_for('auth.login'))


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('auth.login'))
