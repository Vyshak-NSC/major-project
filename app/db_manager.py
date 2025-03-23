from datetime import datetime
from sqlalchemy import func
from werkzeug.security import generate_password_hash
from .models import Camp, CampNotification, Donation, DonationAmount, UserActivity, Volunteer, User, VolunteerHistory, VolunteerRole , Thread, Reply, db


def get_table_count():
    list = {
        'users':User.query.count(),
        'camps':Camp.query.count(),
        'warehouses':0,
        'sensors':0
    }
    return list

################## Camps Management Functions ##################
class CampManager:
    @staticmethod
    def create_camp(camp_name, location, coordinates_lat, coordinates_lng, capacity, contact_number):
        """
        Create a new camp and add it to the database.
        """
        try:
            new_camp = Camp(
                camp_name=camp_name,
                location=location,
                coordinates_lat=coordinates_lat,
                coordinates_lng=coordinates_lng,
                capacity=capacity,
                contact_number=contact_number,
                status="Operational",  # Default status
                num_people_present=0,  # Default value
                food_stock_quota=0,  # Default value
                water_stock_litres=0,  # Default value
                people_list=[],  # Default empty list
                donations_received=0.0,  # Default value
                donations_spent=0.0  # Default value
            )
            
            db.session.add(new_camp)
            db.session.commit()
            return new_camp
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Database error: {str(e)}")


    @staticmethod
    def delete_camp(cid):
        """
        Delete an existing camp by its ID.
        """
        camp = Camp.query.get(cid)
        camp_n = CampNotification.query.filter_by(camp_id=cid)
        for i in camp_n:
            db.session.delete(i)
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
            print(kwargs.items(),'\n\n')
            for key, value in kwargs.items():
                if hasattr(camp, key):
                    print(f"Updating {key} to {value}")
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


################## User Management Functions ##################
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



################## Volunteer Management Functions ##################
class VolunteerManager:
    @staticmethod
    def add_volunteer(name, email, mobile, location, role_id,user_id):
        """
        Add a new volunteer to the database.
        """
        try:
            # Create a new volunteer
            new_volunteer = Volunteer(
                name=name,
                email=email,
                mobile=mobile,
                location=location,
                role_id=role_id,
                user_id=user_id
            )
            db.session.add(new_volunteer)
            db.session.commit()
            return {"message": "Volunteer added successfully", "volunteer_id": new_volunteer.vid}, 201

        except Exception as e:
            db.session.rollback()
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
    
    @staticmethod
    def get_volunteer_history(user_id):
        """
        Retrieve a list of all volunteers.
        """
        volunteer = Volunteer.query.filter_by(user_id=user_id).first()
        if not volunteer:
            return None
        # Retrieve all history records for the found volunteer.
        data = VolunteerHistory.query.filter_by(vid=volunteer.vid).all()
        history = []
        for record in data:
            vol_role = VolunteerRole.query.get(record.role_id)
            history.append(
                {
                    "vhid": record.vhid,
                    "vid": record.vid,
                    "camp_name": Camp.query.get(record.camp_id).camp_name,
                    'location' : vol_role.location,
                    "role": vol_role.role,
                    "vdate": record.vdate.strftime("%Y-%m-%d %H:%M:%S")
                }
            )
        return history

################## Forum Management Functions ##################
class ForumManager:
    @staticmethod
    @staticmethod
    def create_thread(user_id, title, content):
        """
        Create a new forum thread.
        """
        new_thread = Thread(user_id=user_id, title=title, content=content)
        db.session.add(new_thread)
        db.session.commit()
        return {"message": "Thread created successfully", "thread_id": new_thread.tid}

    @staticmethod
    def get_all_threads():
        """
        Retrieve all threads.
        """
        threads = Thread.query.order_by(Thread.timestamp.desc()).all()
        return [
            {
                "tid": thread.tid,
                "title": thread.title,
                "content": thread.content,
                "user_id": thread.user_id,
                "replies": [
                    {
                        "reply_id": reply.rid,
                        "content": reply.content,
                        "user_id": reply.user_id,
                        "username": (User.query.get(reply.user_id).username if User.query.get(reply.user_id) else ''),
                        "timestamp": reply.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    for reply in thread.replies
                ],  # Convert replies into a JSON-serializable list
                "timestamp": thread.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "reply_count": len(thread.replies)
            }
            for thread in threads
        ]

    @staticmethod
    def get_thread(thread_id):
        """
        Retrieve all threads.
        """
        threads = Thread.query.filter_by(tid=thread_id)
        return [
            {
                "tid": thread.tid,
                "title": thread.title,
                "content": thread.content,
                "user_id": thread.user_id,
                "replies": thread.replies,
                "timestamp": thread.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for thread in threads
        ]

    @staticmethod
    def create_reply(user_id, thread_id, content):
        """
        Create a new reply to a thread.
        """
        new_reply = Reply(user_id=user_id, thread_id=thread_id, content=content)
        db.session.add(new_reply)
        db.session.commit()
        return {"message": "Reply added successfully", "reply_id": new_reply.rid}

    @staticmethod
    def get_replies_for_thread(thread_id):
        """
        Retrieve all replies for a specific thread.
        """
        replies = Reply.query.filter_by(thread_id=thread_id).order_by(Reply.timestamp).all()
        return [
            {
                "rid": reply.rid,
                "thread_id": reply.thread_id,
                "user_id": reply.user_id,
                "content": reply.content,
                "timestamp": reply.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for reply in replies
        ]


################## Donation Management Functions ##################
class DonationManager:
    @staticmethod
    def add_donation(user_id, items=None):
        """
        Add a new donation to the database.
        """
        new_donation = Donation(user_id=user_id, items=items)
        db.session.add(new_donation)
        db.session.commit()
        return {"message": "Donation added successfully", "donation_id": new_donation.did}
    
    @staticmethod
    def get_donation(did):
        """
        Retrieve a donation's details by its ID.
        """
        donation = Donation.query.get(did)
        if donation:
            return {
                "did": donation.did,
                "user_id": donation.user_id,
                "timestamp": donation.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "items": donation.items
            }
        raise DonationNotFound(f"Donation with ID {did} not found.")

    @staticmethod
    def update_donation(did, **kwargs):
        """
        Update a donation's details. Pass keyword arguments for fields to update.
        Example: update_donation(did, amount=500, items={"food": 10, "water": 20})
        """
        donation = Donation.query.get(did)
        if donation:
            for key, value in kwargs.items():
                if hasattr(donation, key):
                    setattr(donation, key, value)
            db.session.commit()
            return donation
        return None

    @staticmethod
    def delete_donation(did):
        """
        Delete a donation by its ID.
        """
        donation = Donation.query.get(did)
        if donation:
            db.session.delete(donation)
            db.session.commit()
            return True
        return False

    @staticmethod
    def list_all_donations():
        """
        Retrieve a list of all donations.
        """
        donations = Donation.query.all()
        return [
            {
                "did": donation.did,
                "user_id": donation.user_id,
                "timestamp": donation.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "items": donation.items
            }
            for donation in donations
        ]
    
    # add donation amount to donationamount
    @staticmethod
    def add_donation_amount(user_id, amount):
        """
        Add a new donation amount to the database.
        """
        new_donation_amount = DonationAmount(user_id=user_id, amount=amount)
        db.session.add(new_donation_amount)
        db.session.commit()
        return {"message": "Donation amount added successfully", "donation_amount_id": new_donation_amount.daid}

    # get donation by user id
    @staticmethod
    def get_donation_by_user(user_id):
        """
        Retrieve a list of all donations by a user.
        """
        donations = Donation.query.filter_by(user_id=user_id).all()
        
        result = []
        for donation in donations:
            for item in donation.items:
                name = item.get('name')
                quantity = item.get('quantity')
                result.append([name,quantity])
        
        return result
            

    # get donation amount by user id
    @staticmethod
    def get_donation_amount_by_user(user_id):
        """
        Retrieve a donation amount by user id.
        """
        donation_amount = DonationAmount.query.filter_by(user_id=user_id).first()
        if donation_amount:
            return donation_amount.amount
        
    @staticmethod
    def get_total_donated_amount():
        amount = db.session.query(func.sum(DonationAmount.amount)).scalar()
        return amount

    @staticmethod
    def get_total_donated_items():
        """
        Retrieve the total items donated, grouped by their unique names and quantities.
        """
        donations = Donation.query.all()  # Fetch all donations
        item_summary = {}

        # Iterate through all donations and aggregate item quantities
        for donation in donations:
            if donation.items:  # Ensure the donation has items
                for item in donation.items:
                    name = item.get('name')
                    quantity = int(item.get('quantity', 0))  # Default quantity to 0 if not provided
                    if name in item_summary:
                        item_summary[name] += quantity
                    else:
                        item_summary[name] = quantity

        return item_summary
    

################## Custom Exceptions ##################

class CampNotFound(Exception):
    """
    Custom exception for when a camp is not found.
    """
    def __init__(self, message="Camp not found"):
        self.message = message
        super().__init__(self.message)

class VolunteerNotFound(Exception):
    """
    Custom exception for when a volunteer is not found.
    """
    def __init__(self, message="Volunteer not found"):
        self.message = message
        super().__init__(self.message)


class UserNotFound(Exception):
    """
    Custom exception for when a user is not found.
    """
    def __init__(self, message="User not found"):
        self.message = message
        super().__init__(self.message)

class DonationNotFound(Exception):
    """
    Custom exception for when a donation is not found.
    """
    def __init__(self, message="Donation not found"):
        self.message = message
        super().__init__(self.message)




def get_user_activity(uid):
    """
    Retrieve a user's recent activity by their ID.
    """
    try:
        # Query the UserActivity table for all activities related to the user
        activities = UserActivity.query.filter_by(user_id=uid).order_by(UserActivity.timestamp.desc()).all()
        
        # Format the results into a list of dictionaries
        activity_list = [
            {
                "activity_id": activity.id,
                "user_id": activity.user_id,
                "action": activity.action,
                "timestamp": activity.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for activity in activities
        ]
        return activity_list
    except Exception as e:
        raise Exception(f"Error retrieving user activity: {str(e)}")

def log_recent_activity(user_id, action):
    """
    Log a new activity entry for a user.
    """
    try:
        # Create a new UserActivity entry
        new_activity = UserActivity(
            user_id=user_id,
            action=action,
            timestamp=datetime.now()  # Automatically set the current timestamp
        )
        db.session.add(new_activity)
        db.session.commit()
        return {"message": "Activity logged successfully", "activity_id": new_activity.id}
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error logging activity: {str(e)}")