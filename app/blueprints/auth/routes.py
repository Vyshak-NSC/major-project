from flask import Blueprint, render_template, redirect, session, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from app.extensions import db, bcrypt
from app.models import User
from . import auth_bp


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password) and user.role == 'user':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('user.index'))
        elif user and bcrypt.check_password_hash(user.password, password) and user.role == 'admin':
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('admin.index'))
        else:
            flash('Invalid email or password', 'danger')
            redirect(url_for('auth.login'))
    return render_template('auth/login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email    = request.values.get('email')
        username = request.values.get('username','user')
        password = request.values.get('password')

        # Hash the password before storing it
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        user = User(username=username, email=email, password=hashed_password, role='user')
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect(url_for('user.index'))

        flash('Account created! You can now log in.', 'success')
    return redirect(url_for('auth.login'))


@auth_bp.route('/admin_register', methods=['GET', 'POST'])
def adminregister():
    if request.method == 'POST':
        email    = request.values.get('email')
        username = request.values.get('username','admin')
        password = request.values.get('password')

        # Hash the password before storing it
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        user = User(username=username, email=email, password=hashed_password, role='admin')
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('Account created! You can now log in.', 'success')
        return redirect(url_for('admin.index'))

    return render_template('auth/login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('auth.login'))
