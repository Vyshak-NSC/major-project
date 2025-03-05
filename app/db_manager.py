from werkzeug.security import generate_password_hash
from .models import Camp, Volunteer, User, db

class CampManager:
    @staticmethod
    def create_camp(camp_name, location, coordinates_lat, coordinates_lng, capacity, contact_number, status="Operational"):
        """
        Create a new camp and add it to the database.
        """
        new_camp = Camp(
            camp_name=camp_name,
            location=location,
            coordinates_lat=coordinates_lat,
            coordinates_lng=coordinates_lng,
            capacity=capacity,
            contact_number=contact_number,
            status=status
        )
        db.session.add(new_camp)
        db.session.commit()
        return new_camp

    @staticmethod
    def delete_camp(cid):
        """
        Delete an existing camp by its ID.
        """
        camp = Camp.query.get(cid)
        if camp:
            db.session.delete(camp)
            db.session.commit()
            return True
        return False

    @staticmethod
    def get_camp_data(cid):
        """
        Retrieve data for a specific camp by its ID and return it as a dictionary.
        """
        camp = Camp.query.get(cid)
        if camp:
            return {
                "cid": camp.cid,
                "camp_name": camp.camp_name,
                "location": camp.location,
                "coordinates": {
                    "lat": camp.coordinates_lat,
                    "lng": camp.coordinates_lng
                },
                "status": camp.status,
                "capacity": camp.capacity,
                "num_people_present": camp.num_people_present,
                "food_stock_quota": camp.food_stock_quota,
                "water_stock_litres": camp.water_stock_litres,
                "contact_number": camp.contact_number,
                "people_list": camp.people_list,
                "donations_received": camp.donations_received,
                "donations_spent": camp.donations_spent
            }
        raise CampNotFound(f"Camp with ID {cid} not found.")

    @staticmethod
    def update_camp_data(cid, **kwargs):
        """
        Update camp data. Pass keyword arguments for fields to update.
        Example: update_camp_data(cid, food_stock_quota=500, water_stock_litres=1000)
        """
        camp = Camp.query.get(cid)
        if camp:
            for key, value in kwargs.items():
                if hasattr(camp, key):
                    setattr(camp, key, value)
            db.session.commit()
            return camp
        return None

    @staticmethod
    def list_all_camps():
        """
        Retrieve a list of all camps.
        """
        camps = Camp.query.all()
        return [
            {
                "cid": camp.cid,
                "camp_name": camp.camp_name,
                "location": camp.location,
                "coordinates": {
                    "lat": camp.coordinates_lat,
                    "lng": camp.coordinates_lng
                },
                "status": camp.status,
                "capacity": camp.capacity,
                "num_people_present": camp.num_people_present,
                "food_stock_quota": camp.food_stock_quota,
                "water_stock_litres": camp.water_stock_litres,
                "contact_number": camp.contact_number,
                "people_list": camp.people_list,
                "donations_received": camp.donations_received,
                "donations_spent": camp.donations_spent
            }
            for camp in camps
        ]
        

#errors
class CampNotFound(Exception):
    """
    Custom exception for when a camp is not found.
    """
    def __init__(self, message="Camp not found"):
        self.message = message
        super().__init__(self.message)
        
class VolunteerManager:
    @staticmethod
    def add_volunteer(name, email, mobile, location, role_id):
        """
        Add a new volunteer to the database.
        """
        try:
            # Validate required fields
            # if not name or not email or not role_id:
            #     raise ValueError("Name, email, and role ID are required")

            # Check if the email is already registered
            if Volunteer.query.filter_by(email=email).first():
                raise ValueError("Email already registered")

            # Create a new volunteer
            new_volunteer = Volunteer(
                name=name,
                email=email,
                mobile=mobile,
                location=location,
                role_id=role_id
            )
            db.session.add(new_volunteer)
            db.session.commit()

            return {"message": "Volunteer registered successfully", "volunteer_id": new_volunteer.vid}, 201
        except Exception as e:
            return {"error": str(e)}, 500

    @staticmethod
    def get_volunteer(vid):
        """
        Retrieve a volunteer's details by their ID.
        """
        volunteer = Volunteer.query.get(vid)
        if volunteer:
            return {
                "vid": volunteer.vid,
                "name": volunteer.name,
                "email": volunteer.email,
                "mobile": volunteer.mobile,
                "location": volunteer.location,
                "role_id": volunteer.role_id
            }
        raise VolunteerNotFound(f"Volunteer with ID {vid} not found.")

    @staticmethod
    def update_volunteer(vid, **kwargs):
        """
        Update a volunteer's details. Pass keyword arguments for fields to update.
        Example: update_volunteer(vid, mobile="1234567890", location="New City")
        """
        volunteer = Volunteer.query.get(vid)
        if volunteer:
            for key, value in kwargs.items():
                if hasattr(volunteer, key):
                    setattr(volunteer, key, value)
            db.session.commit()
            return volunteer
        return None

    @staticmethod
    def delete_volunteer(vid):
        """
        Delete a volunteer by their ID.
        """
        volunteer = Volunteer.query.get(vid)
        if volunteer:
            db.session.delete(volunteer)
            db.session.commit()
            return True
        return False

    @staticmethod
    def list_all_volunteers():
        """
        Retrieve a list of all volunteers.
        """
        volunteers = Volunteer.query.all()
        return [
            {
                "vid": volunteer.vid,
                "name": volunteer.name,
                "email": volunteer.email,
                "mobile": volunteer.mobile,
                "location": volunteer.location,
                "role_id": volunteer.role_id
            }
            for volunteer in volunteers
        ]


# Errors
class VolunteerNotFound(Exception):
    """
    Custom exception for when a volunteer is not found.
    """
    def __init__(self, message="Volunteer not found"):
        self.message = message
        super().__init__(self.message)




class UserManager:
    @staticmethod
    def add_user(username, email, password, role="user"):
        """
        Add a new user to the database.
        """
        try:
            # Check if the email is already registered
            if User.query.filter_by(email=email).first():
                raise ValueError("Email already registered")

            hashed_password = generate_password_hash(password)

            # Create a new user
            new_user = User(
                username=username,
                email=email,
                role=role
            )
            new_user.set_password(password)
            
            db.session.add(new_user)
            db.session.commit()
            return {"message": "User added successfully", "user_id": new_user.uid}, 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    
    @staticmethod
    def get_user(uid):
        """
        Retrieve a user's details by their ID.
        """
        user = User.query.get(uid)
        if user:
            return {
                "uid": user.uid,
                "username": user.username,
                "email": user.email,
                "location": user.location,
                "mobile": user.mobile,
                "role": user.role,
                "associated_camp_id": user.associated_camp_id,
                "friend_list": user.friend_list,
                "family_list": user.family_list
            }
        raise UserNotFound(f"User with ID {uid} not found.")

    @staticmethod
    def update_user(uid, **kwargs):
        """
        Update a user's details. Pass keyword arguments for fields to update.
        Example: update_user(uid, username="new_username", email="new_email@example.com")
        """
        user = User.query.get(uid)
        if user:
            for key, value in kwargs.items():
                if hasattr(user, key):
                    setattr(user, key, value)
            db.session.commit()
            return user
        return None

    @staticmethod
    def delete_user(uid):
        """
        Delete a user by their ID.
        """
        user = User.query.get(uid)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False

    @staticmethod
    def list_all_users():
        """
        Retrieve a list of all users.
        """
        users = User.query.all()
        return [
            {
                "uid": user.uid,
                "username": user.username,
                "email": user.email,
                "location": user.location,
                "mobile": user.mobile,
                "role": user.role,
                "associated_camp_id": user.associated_camp_id,
                "friend_list": user.friend_list,
                "family_list": user.family_list
            }
            for user in users
        ]


# Errors
class UserNotFound(Exception):
    """
    Custom exception for when a user is not found.
    """
    def __init__(self, message="User not found"):
        self.message = message
        super().__init__(self.message)