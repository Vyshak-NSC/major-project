from .extensions import db
from flask_login import UserMixin

class User(db.Model, UserMixin):
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    associated_camp_id = db.Column(db.Integer, db.ForeignKey('camp.cid'))
    friend_list = db.Column(db.PickleType, default=[])
    family_list = db.Column(db.PickleType, default=[])
    role = db.Column(db.String(20), nullable=False, default='user')  # user, admin, local_auth
    location = db.Column(db.String(100))
    mobile = db.Column(db.String(20))

    def __repr__(self):
        return f"<User {self.username}>"

class Camp(db.Model):
    cid = db.Column(db.Integer, primary_key=True)
    camp_name = db.Column(db.String(100), unique=True, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    coordinates_lat = db.Column(db.Float, nullable=False)  # Latitude
    coordinates_lng = db.Column(db.Float, nullable=False)  # Longitude
    status = db.Column(db.String(20), nullable=False, default="Operational")
    capacity = db.Column(db.Integer, nullable=False)
    num_people_present = db.Column(db.Integer, default=0)
    food_stock_quota = db.Column(db.Integer, default=0)
    water_stock_litres = db.Column(db.Integer, default=0)
    contact_number = db.Column(db.String(20))
    announcements = db.Column(db.Text, default="")
    people_list = db.Column(db.PickleType, default=[])