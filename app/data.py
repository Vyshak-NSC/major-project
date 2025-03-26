from faker import Faker
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import GridSearchCV
import datetime
import time
import os

# Initialize Faker instance
fake = Faker()

# Label Encoders for soil types and sensors
label_encoder = LabelEncoder()
soil_types_categories = ['clay', 'sand', 'loam', 'silt']
label_encoder.fit(soil_types_categories)
sensor_label_encoder = LabelEncoder()
sensors = ['Sensor 1', 'Sensor 2']
sensor_label_encoder.fit(sensors)

# Soil-specific thresholds
soil_thresholds = {
    'clay': {
        'rainfall_high': 180,
        'rainfall_medium': 100,
        'soil_saturation_high': 80,
        'soil_saturation_medium': 65,
        'slope_high': 30,
        'slope_medium': 22,
        'seismic_activity_high': 5.5,
        'seismic_activity_medium': 4.5
    },
    'sand': {
        'rainfall_high': 250,
        'rainfall_medium': 160,
        'soil_saturation_high': 90,
        'soil_saturation_medium': 75,
        'slope_high': 40,
        'slope_medium': 32,
        'seismic_activity_high': 6.5,
        'seismic_activity_medium': 5.5
    },
    'loam': {
        'rainfall_high': 220,
        'rainfall_medium': 130,
        'soil_saturation_high': 85,
        'soil_saturation_medium': 60,
        'slope_high': 35,
        'slope_medium': 28,
        'seismic_activity_high': 6.0,
        'seismic_activity_medium': 5
    },
    'silt': {
        'rainfall_high': 200,
        'rainfall_medium': 120,
        'soil_saturation_high': 80,
        'soil_saturation_medium': 70,
        'slope_high': 32,
        'slope_medium': 28,
        'seismic_activity_high': 5.8,
        'seismic_activity_medium': 4.5
    }
}

def generate_rainfall():
    """
    Generate rainfall value aligned with global standards.
    Example: High-risk rainfall is 150–200 mm/day, medium-risk is 80–150 mm/day.
    """
    # Use a normal distribution centered around 100 mm with a standard deviation of 40 mm
    rainfall = np.random.normal(loc=100, scale=40)
    # Ensure rainfall is within realistic bounds (0–200 mm)
    return max(0, min(200, round(rainfall, 2)))

def generate_forecasted_rainfall():
    """
    Generate forecasted rainfall value aligned with global standards.
    Example: High-risk forecasted rainfall is 100–150 mm/day, medium-risk is 50–100 mm/day.
    """
    # Use a normal distribution centered around 75 mm with a standard deviation of 30 mm
    forecasted_rainfall = np.random.normal(loc=75, scale=30)
    # Ensure forecasted rainfall is within realistic bounds (0–150 mm)
    return max(0, min(150, round(forecasted_rainfall, 2)))

def generate_soil_saturation(soil_type):
    """
    Generate soil saturation value based on soil type and global standards.
    Example: Clay soils fail at 80–90%, sand soils at 70–80%.
    """
    if soil_type == "clay":
        # Clay soils saturate at 80–90%
        return round(np.random.uniform(50, 60), 2)
    elif soil_type == "sand":
        # Sand soils saturate at 70–80%
        return round(np.random.uniform(60, 75), 2)
    elif soil_type == "loam":
        # Loam soils saturate at 75–85%
        return round(np.random.uniform(45, 55), 2)
    elif soil_type == "silt":
        # Silt soils saturate at 70–80%
        return round(np.random.uniform(55, 65), 2)
    else:
        # Default to 60–90% for unknown soil types
        return round(np.random.uniform(60, 90), 2)  

def generate_slope():
    """
    Generate slope value aligned with global standards.
    Example: Slopes >30° are high-risk, 20–30° are medium-risk.
    """
    # Use a normal distribution centered around 25° with a standard deviation of 10°
    slope = np.random.normal(loc=25, scale=10)
    # Ensure slope is within realistic bounds (0–50°)
    return max(0, min(50, round(slope, 2)))

def generate_seismic_activity():
    """
    Generate seismic activity value aligned with global standards.
    Example: Magnitude 6.0+ is high-risk, 4.5–6.0 is medium-risk.
    """
    # Use a normal distribution centered around 3.0 with a standard deviation of 2.0
    seismic_activity = np.random.normal(loc=3.0, scale=2.0)
    # Ensure seismic activity is within realistic bounds (0–10)
    return max(0, min(10, round(seismic_activity, 2)))

def generate_soil_type():
    """Generate soil type using Faker."""
    return fake.random_element(elements=('clay', 'sand', 'loam', 'silt'))

def preprocess_data(data):
    """Normalize features for better model performance."""
    scaler = MinMaxScaler()
    features = ['rainfall', 'forecasted_rainfall', 'soil_saturation', 'slope', 'seismic_activity']
    data[features] = scaler.fit_transform(data[features])
    return data

def train_model(data):
    """
    Train a Random Forest Classifier with hyperparameter tuning.
    """
    data['soil_type'] = label_encoder.transform(data['soil_type'])
    data['sensor'] = sensor_label_encoder.transform(data['sensor'])
    X = data[['rainfall', 'forecasted_rainfall', 'soil_saturation', 'slope', 'seismic_activity', 'soil_type', 'sensor']]
    y = data['landslide']
    # Define parameter grid for hyperparameter tuning
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    # Perform Grid Search for best parameters
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, scoring='accuracy')
    grid_search.fit(X, y)
    print("Best Parameters:", grid_search.best_params_)
    return grid_search.best_estimator_

def generate_time_series_data(n_timestamps=100, time_interval_seconds=3600, sensor="Sensor 1", start_time=None):
    """
    Generate synthetic time-series data for landslide prediction using Faker.
    """
    if start_time is None:
        start_time = datetime.datetime.now()
    
    # Generate timestamps
    timestamps = pd.date_range(start=start_time, periods=n_timestamps, freq=f'{time_interval_seconds}s')
    
    # Generate rainfall and forecasted rainfall
    rainfall = [generate_rainfall() for _ in range(n_timestamps)]
    forecasted_rainfall = [generate_forecasted_rainfall() for _ in range(n_timestamps)]
    
    # Generate soil type (constant for the entire time series)
    soil_type = generate_soil_type()
    
    # Generate soil saturation based on soil type
    soil_saturation = [generate_soil_saturation(soil_type) for _ in range(n_timestamps)]
    
    # Generate slope and seismic activity
    slope = [generate_slope() for _ in range(n_timestamps)]
    seismic_activity = [generate_seismic_activity() for _ in range(n_timestamps)]
    
    # Create DataFrame
    df = pd.DataFrame({
        'timestamp': timestamps,
        'rainfall': rainfall,
        'forecasted_rainfall': forecasted_rainfall,
        'soil_saturation': soil_saturation,
        'slope': slope,
        'seismic_activity': seismic_activity,
        'soil_type': soil_type,  # Constant soil type for the entire time series
        'sensor': sensor
    })
    
    # Determine landslide risk based on thresholds
    df['landslide'] = ((df['rainfall'] + df['forecasted_rainfall'] > 150) & (df['soil_saturation'] > 60)) | \
                      ((df['slope'] > 30) & (df['rainfall'] > 100)) | (df['seismic_activity'] > 6)
    df['landslide'] = df['landslide'].astype(int)
    
    return df

def calculate_status_and_risk(sensor):
    """
    Determine the status, risk level, and affected radius based on sensor data.
    """
    rainfall = sensor["rainfall"]
    forecasted_rainfall = sensor["forecasted_rainfall"]
    soil_saturation = sensor["soil_saturation"]
    slope = sensor["slope"]
    seismic_activity = sensor["seismic_activity"]
    soil_type = sensor["soil_type"]

    # Get thresholds for the specific soil type
    thresholds = soil_thresholds.get(soil_type, soil_thresholds['clay'])  # Default to 'clay' if unknown

    if (rainfall > thresholds['rainfall_high'] or 
        soil_saturation > thresholds['soil_saturation_high'] or 
        slope > thresholds['slope_high'] or 
        seismic_activity > thresholds['seismic_activity_high']):
        status = "Alert"
        risk = "High"
        affected_radius = np.random.randint(5000, 10000)  # 5–10 km
    elif (thresholds['rainfall_medium'] <= rainfall <= thresholds['rainfall_high'] or 
          thresholds['soil_saturation_medium'] <= soil_saturation <= thresholds['soil_saturation_high'] or 
          thresholds['slope_medium'] <= slope <= thresholds['slope_high'] or 
          thresholds['seismic_activity_medium'] <= seismic_activity <= thresholds['seismic_activity_high']):
        status = "Warning"
        risk = "Medium"
        affected_radius = np.random.randint(1000, 5000)  # 1–5 km
    else:
        status = "Normal"
        risk = "Low"
        affected_radius = 0
    return status, risk, affected_radius

def calculate_landslide_time(sensor):
    """
    Calculate the approximate time of a landslide based on sensor data.
    Incorporates soil type, dynamic risk levels, and environmental conditions.
    Ensures the predicted time is at least a week (or more) in the future.
    """
    # Extract relevant sensor data
    status = sensor["status"]
    soil_type = sensor["soil_type"]
    rainfall = sensor["rainfall"]
    forecasted_rainfall = sensor["forecasted_rainfall"]
    soil_saturation = sensor["soil_saturation"]
    slope = sensor["slope"]
    seismic_activity = sensor["seismic_activity"]

    # Soil-specific base time offsets (in days)
    soil_time_offsets = {
        'clay': {'Alert': 7, 'Warning': 14},
        'sand': {'Alert': 5, 'Warning': 10},
        'loam': {'Alert': 6, 'Warning': 12},
        'silt': {'Alert': 6, 'Warning': 13}
    }

    if status == "Normal":
        return None  # No prediction for normal conditions

    # Base prediction range based on soil type and status
    base_offset = soil_time_offsets.get(soil_type, soil_time_offsets['clay'])[status]

    # Adjust prediction based on environmental factors
    if status == "Alert":
        # Higher rainfall or seismic activity reduces the time to landslide
        time_adjustment = max(
            0,
            -int(rainfall / 20)  # Reduce 1 day for every 20 mm of rainfall
            - int(forecasted_rainfall / 30)  # Reduce 1 day for every 30 mm of forecasted rainfall
            - int(soil_saturation / 20)  # Reduce 1 day for every 20% soil saturation
            - int(seismic_activity * 2)  # Reduce 2 days for every unit of seismic activity
        )
        min_days = max(7, base_offset + time_adjustment)  # Ensure at least 7 days
        max_days = min_days + np.random.randint(3, 8)  # Add variability (3–7 days)
    elif status == "Warning":
        # Moderate conditions allow for a longer prediction window
        time_adjustment = max(
            0,
            -int(rainfall / 30)  # Reduce 1 day for every 30 mm of rainfall
            - int(forecasted_rainfall / 40)  # Reduce 1 day for every 40 mm of forecasted rainfall
            - int(soil_saturation / 25)  # Reduce 1 day for every 25% soil saturation
            - int(seismic_activity * 1.5)  # Reduce 1.5 days for every unit of seismic activity
        )
        min_days = max(14, base_offset + time_adjustment)  # Ensure at least 14 days
        max_days = min_days + np.random.randint(5, 10)  # Add variability (5–9 days)

    # Return a random prediction within the adjusted range
    return datetime.timedelta(days=np.random.randint(min_days, max_days))
def generate_sensor_data():
    """
    Generate real-time sensor data.
    """
    sensors = [
        {
            "id": 1,
            "lat": 11.921062,
            "lng": 75.355452, 
            "label": "Sensor 1: Unknown, India",
            "rainfall": generate_rainfall(),
            "forecasted_rainfall": generate_forecasted_rainfall(),
            "soil_type": fake.random_element(elements=('clay', 'sand', 'loam', 'silt')),  # Generate soil type
            "soil_saturation": None,  # Placeholder for soil saturation
            "slope": generate_slope(),
            "seismic_activity": generate_seismic_activity(),
            "status": "Normal",
            "risk": "Low",
            "affectedRadius": 0,
            "sensor": "Sensor 1",
            "predicted_landslide_time": None
        },
        {
            "id": 2,
            "lat": 11.695785, 
            "lng": 76.031938,
            "label": "Sensor 2: Wayanad, Kerala",
            "rainfall": generate_rainfall(),
            "forecasted_rainfall": generate_forecasted_rainfall(),
            "soil_type": fake.random_element(elements=('clay', 'sand', 'loam', 'silt')),  # Generate soil type
            "soil_saturation": None,  # Placeholder for soil saturation
            "slope": generate_slope(),
            "seismic_activity": generate_seismic_activity(),
            "status": "Normal",
            "risk": "Low",
            "affectedRadius": 0,
            "sensor": "Sensor 2",
            "predicted_landslide_time": None
        }
    ]
    # Populate soil saturation based on soil type
    for sensor in sensors:
        sensor["soil_saturation"] = generate_soil_saturation(sensor["soil_type"])
    
    # Calculate status, risk, and affected radius for each sensor
    for sensor in sensors:
        status, risk, affected_radius = calculate_status_and_risk(sensor)
        sensor["status"] = status
        sensor["risk"] = risk
        sensor["affectedRadius"] = affected_radius
    
    # Calculate predicted landslide time for sensors with non-normal status
    for sensor in sensors:
        if sensor["status"] != "Normal":
            time_offset = calculate_landslide_time(sensor)
            if time_offset:
                approx_time = datetime.datetime.now() + time_offset
                approx_time_str = approx_time.strftime('%d-%m-%Y %I:%M %p')
                sensor["predicted_landslide_time"] = approx_time_str
        else:
            sensor["predicted_landslide_time"] = None
    
    return sensors
def save_sensor_data_to_json(sensors):
    """
    Save sensor data to a JSON file inside the 'app/static' folder.
    """
    static_folder_path = "app/static"
    os.makedirs(static_folder_path, exist_ok=True)  # Ensure the folder exists
    file_path = os.path.join(static_folder_path, "sensor_data.json")
    
    with open(file_path, "w") as file:
        json.dump(sensors, file, indent=4)
    
    print(f"Sensor data saved to {file_path}")

def main():
    """
    Main function to execute the program.
    """
    # Generate training data for landslide prediction
    sensor_1_data = generate_time_series_data(2000, time_interval_seconds=3600, sensor="Sensor 1", start_time=datetime.datetime.now())
    sensor_2_data = generate_time_series_data(2000, time_interval_seconds=3600, sensor="Sensor 2", start_time=datetime.datetime.now())
    combined_training_data = pd.concat([sensor_1_data, sensor_2_data], ignore_index=True)
    # Preprocess data
    combined_training_data = preprocess_data(combined_training_data)
    # Train the model
    model = train_model(combined_training_data)
    # Real-time monitoring loop
    while True:
        # Generate synthetic sensor data
        sensors = generate_sensor_data()
        # Save sensor data to JSON
        save_sensor_data_to_json(sensors)
        # Wait for 1 minute before updating the data again
        print("Waiting for 1 minute before next update...")
        time.sleep(60)

if __name__ == "__main__":
    main()