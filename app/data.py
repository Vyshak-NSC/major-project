from faker import Faker
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import GridSearchCV
import datetime
import time

# Initialize Faker instance
fake = Faker()

# Label Encoders for soil types and sensors
label_encoder = LabelEncoder()
soil_types_categories = ['clay', 'sand', 'loam', 'silt']
label_encoder.fit(soil_types_categories)
sensor_label_encoder = LabelEncoder()
sensors = ['Sensor 1', 'Sensor 2']
sensor_label_encoder.fit(sensors)

def generate_rainfall():
    """Generate rainfall value between 0 and 200 mm using Faker."""
    return fake.pyfloat(min_value=0, max_value=200, right_digits=2)

def generate_forecasted_rainfall():
    """Generate forecasted rainfall value between 0 and 100 mm using Faker."""
    return fake.pyfloat(min_value=0, max_value=100, right_digits=2)

def generate_soil_saturation():
    """Generate soil saturation value between 10% and 100% using Faker."""
    return fake.pyfloat(min_value=10, max_value=100, right_digits=2)

def generate_slope():
    """Generate slope value between 5 degrees and 50 degrees using Faker."""
    return fake.pyfloat(min_value=5, max_value=50, right_digits=2)

def generate_seismic_activity():
    """Generate seismic activity value between 0 and 10 using Faker."""
    return fake.pyfloat(min_value=0, max_value=10, right_digits=2)

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
    timestamps = pd.date_range(start=start_time, periods=n_timestamps, freq=f'{time_interval_seconds}s')
    rainfall = [generate_rainfall() for _ in range(n_timestamps)]
    forecasted_rainfall = [generate_forecasted_rainfall() for _ in range(n_timestamps)]
    soil_saturation = [generate_soil_saturation() for _ in range(n_timestamps)]
    slope = [generate_slope() for _ in range(n_timestamps)]
    seismic_activity = [generate_seismic_activity() for _ in range(n_timestamps)]
    soil_type = [generate_soil_type() for _ in range(n_timestamps)]
    df = pd.DataFrame({
        'timestamp': timestamps,
        'rainfall': rainfall,
        'forecasted_rainfall': forecasted_rainfall,
        'soil_saturation': soil_saturation,
        'slope': slope,
        'seismic_activity': seismic_activity,
        'soil_type': soil_type,
        'sensor': sensor
    })
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
    if (rainfall > 200 or soil_saturation > 90 or slope > 35 or seismic_activity > 6.0):
        status = "Alert"
        risk = "High"
        affected_radius = np.random.randint(5000, 10000)  # 5–10 km
    elif (100 <= rainfall <= 200 or 70 <= soil_saturation <= 90 or 25 <= slope <= 35 or 4.5 <= seismic_activity <= 6.0):
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
    """
    if sensor["status"] == "Alert":
        return datetime.timedelta(hours=np.random.randint(6, 12))
    elif sensor["status"] == "Warning":
        return datetime.timedelta(hours=np.random.randint(18, 36))
    else:
        return None

def generate_sensor_data():
    """
    Generate real-time sensor data using Faker.
    """
    sensors = [
        {
            "id": 1,
            "lat": 11.921062,
            "lng":  75.355452, 
            "label": "Sensor 1: Unknown, India",
            "rainfall": generate_rainfall(),
            "forecasted_rainfall": generate_forecasted_rainfall(),
            "soil_saturation": generate_soil_saturation(),
            "slope": generate_slope(),
            "seismic_activity": generate_seismic_activity(),
            "soil_type": "clay",
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
            "soil_saturation": generate_soil_saturation(),
            "slope": generate_slope(),
            "seismic_activity": generate_seismic_activity(),
            "soil_type": "loam",
            "status": "Normal",
            "risk": "Low",
            "affectedRadius": 0,
            "sensor": "Sensor 2",
            "predicted_landslide_time": None
        }
    ]
    for sensor in sensors:
        status, risk, affected_radius = calculate_status_and_risk(sensor)
        sensor["status"] = status
        sensor["risk"] = risk
        sensor["affectedRadius"] = affected_radius

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
    Save sensor data to a JSON file.
    """
    with open("./static/sensor_data.json", "w") as file:
        json.dump(sensors, file, indent=4)
    print("Sensor data saved to sensor_data.json")

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
        # Wait for 1 minutes before updating the data again
        print("Waiting for 1 minutes before next update...")
        time.sleep(10)  # Sleep for 60 seconds (1 minutes)

if __name__ == "__main__":
    main()