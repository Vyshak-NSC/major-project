from .models import Camp, db

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
                "announcements": camp.announcements.split("\n") if camp.announcements else [],
                "people_list": camp.people_list
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
                "announcements": camp.announcements.split("\n") if camp.announcements else [],
                "people_list": camp.people_list
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