from sqlalchemy import func
from .extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.hybrid import hybrid_property

class User(db.Model, UserMixin):
    uid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    associated_camp_id = db.Column(
        db.Integer, 
        db.ForeignKey('camp.cid', name='fk_user_associated_camp_id', ondelete='SET NULL'),  # Named foreign key
        nullable=True
    )
    role = db.Column(db.String(20), nullable=False, default='user')  # user, admin, local_auth
    location = db.Column(db.String(100))
    mobile = db.Column(db.String(20))
    donation = db.relationship("Donation", back_populates="user", lazy=True)
    donation_amount = db.relationship("DonationAmount", backref="user", lazy=True)

    # One-to-one relationship with Volunteer
    volunteer = db.relationship('Volunteer', backref='user', uselist=False)

    def __repr__(self):
        return f"<User {self.username}>"

    def set_password(self, password):
        """Hash and store the password."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Check if the password matches the stored hash."""
        return check_password_hash(self.password, password)

    # Override the get_id() method to return the uid as a string
    def get_id(self):
        return str(self.uid)  # Ensure the ID is returned as a string


class Camp(db.Model):
    cid = db.Column(db.Integer, primary_key=True)
    camp_name = db.Column(db.String(100), unique=True, nullable=False)
    camp_head_id = db.Column(db.Integer, db.ForeignKey('user.uid', name='fk_camp_head_id', ondelete='SET NULL'), nullable=True)
    camp_head = db.relationship('User', foreign_keys=[camp_head_id])

    location = db.Column(db.String(100), nullable=False)
    coordinates_lat = db.Column(db.Float, nullable=False)
    coordinates_lng = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Operational")

    capacity = db.Column(db.Integer, nullable=False)
    contact_number = db.Column(db.String(20))
    
    people_list = db.Column(db.JSON, default=[])  # JSON list of user IDs
    campNotifications = db.relationship('CampNotification', backref='camp', lazy=True)

    food_capacity = db.Column(db.Integer, default=0)
    food_stock_quota = db.Column(db.Integer, default=0)
    
    water_capacity = db.Column(db.Integer, default=0)
    water_stock_litres = db.Column(db.Integer, default=0)
    
    essentials_capacity = db.Column(db.Integer, default=0)
    essentials_stock = db.Column(db.Integer, default=0)
    
    clothes_capacity = db.Column(db.Integer, default=0)
    clothes_stock = db.Column(db.Integer, default=0)

    # Define relationship with users in the camp
    users = db.relationship('User', backref='camp', lazy=True, foreign_keys='User.associated_camp_id')

    @hybrid_property
    def num_people_present(self):
        """Compute the number of people in the camp dynamically."""
        return len(self.people_list)  # OR len(self.users) if using relationships

    @num_people_present.expression
    def num_people_present(cls):
        """Allows querying with SQL expressions."""
        return (db.select([func.count(User.uid)])
                .where(User.associated_camp_id == cls.cid)
                .scalar_subquery())

class CampNotification(db.Model):
    aid = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    camp_id = db.Column(
        db.Integer, 
        db.ForeignKey('camp.cid', name='fk_camp_notification_camp_id', ondelete='CASCADE'),  # Named foreign key
        nullable=False
    )


class Volunteer(db.Model):
    vid = db.Column(db.Integer, primary_key=True)  # Volunteer ID
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_volunteer_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    name = db.Column(db.String(100), nullable=False)  # Name of the volunteer
    email = db.Column(db.String(100), nullable=False)  # Email address
    mobile = db.Column(db.String(20))  # Phone number
    location = db.Column(db.String(100))  # Location of the volunteer
    role_id = db.Column(db.Integer, nullable=False)  # Role ID (e.g., 1 for Admin, 2 for Volunteer, etc.)

    def __repr__(self):
        return f"<Volunteer {self.name}>"


class VolunteerHistory(db.Model):
    vhid = db.Column(db.Integer, primary_key=True)
    vid = db.Column(
        db.Integer, 
        db.ForeignKey('volunteer.vid', name='fk_volunteer_history_volunteer_vid', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    camp_id = db.Column(
        db.Integer, 
        db.ForeignKey('camp.cid', name='fk_volunteer_history_camp_cid', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    role_id = db.Column(db.Integer, nullable=False)
    vdate = db.Column(db.DateTime, default=db.func.current_timestamp())
    volunteer = db.relationship('Volunteer', backref='volunteer_history', lazy=True)
    camp = db.relationship('Camp', backref='volunteer_history', lazy=True)


class VolunteerRole(db.Model):
    role_id = db.Column(db.String, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)


class Thread(db.Model):
    tid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_thread_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    replies = db.relationship('Reply', backref='thread', lazy=True)


class Reply(db.Model):
    rid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    thread_id = db.Column(
        db.Integer, 
        db.ForeignKey('thread.tid', name='fk_reply_thread_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_reply_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())


class Feedback(db.Model):
    fid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(500), nullable=False)


class Donation(db.Model):
    did = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Unique donation ID
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_donation_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )  # User who made the donation
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)  # Timestamp of donation
    items = db.Column(db.JSON, nullable=True)  # Dictionary of donated items (nullable)

    # Relationship to the User model (assuming you have a User model)
    user = db.relationship("User", back_populates="donation")

    def __init__(self, user_id, amount=None, items=None):
        """
        Initialize a new donation.
        :param user_id: ID of the user making the donation.
        :param amount: Monetary donation amount (optional).
        :param items: Dictionary of donated items (optional).
        """
        if amount is None and items is None:
            raise ValueError("Either 'amount' or 'items' must be provided.")

        self.user_id = user_id
        self.amount = amount
        self.items = items

    def __repr__(self):
        return f"<Donation(did={self.did}, user_id={self.user_id}, amount={self.amount}, items={self.items})>"


class DonationAmount(db.Model):
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_donation_amount_user_id'),  # Named foreign key
        primary_key=True
    )
    amount_id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)


class UserActivity(db.Model):
    __tablename__ = 'user_activity'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_user_activity_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=False
    )
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)

    def __repr__(self):
        return f"<UserActivity(id={self.id}, user_id={self.user_id}, action='{self.action}', timestamp='{self.timestamp}')>"


class RecentActivity(db.Model):
    __tablename__ = 'recent_activities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.uid', name='fk_recent_activity_user_id', ondelete='SET NULL'),  # Named foreign key
        nullable=True  # Nullable for soft deletes
    )
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)

    # Relationship to the User model
    user = db.relationship('User', backref='recent_activities')

    def __repr__(self):
        return f"<RecentActivity(id={self.id}, user_id={self.user_id}, action='{self.action}', timestamp='{self.timestamp}')>"