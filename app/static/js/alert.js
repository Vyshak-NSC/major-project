// Function to calculate distance between two coordinates (in km)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Fetch sensor data from JSON file
async function fetchSensorData() {
    try {
        const response = await fetch("/get_sensor_data");
        if (!response.ok) {
            throw new Error("Failed to fetch sensor data");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        return [];
    }
}

// Fetch hazardous features near a location using Overpass API
async function fetchHazardousFeatures(lat, lng, radius = 5) {
    const overpassUrl = `
        https://overpass-api.de/api/interpreter?data=
        [out:json];
        (
            node["natural"="water"](around:${radius * 1000},${lat},${lng});
            way["natural"="water"](around:${radius * 1000},${lat},${lng});
            relation["natural"="water"](around:${radius * 1000},${lat},${lng});
            node["natural"="cliff"](around:${radius * 1000},${lat},${lng});
            way["natural"="cliff"](around:${radius * 1000},${lat},${lng});
            relation["natural"="cliff"](around:${radius * 1000},${lat},${lng});
            node["landuse"="quarry"](around:${radius * 1000},${lat},${lng});
            way["landuse"="quarry"](around:${radius * 1000},${lat},${lng});
            relation["landuse"="quarry"](around:${radius * 1000},${lat},${lng});
            node["geological"="hazard"](around:${radius * 1000},${lat},${lng});
            way["geological"="hazard"](around:${radius * 1000},${lat},${lng});
            relation["geological"="hazard"](around:${radius * 1000},${lat},${lng});
        );
        out center;
    `.replace(/\s+/g, ''); // Remove whitespace for compact URL

    try {
        const response = await fetch(overpassUrl);
        const data = await response.json();
        return data.elements.map(element => {
            if (element.center) {
                return { lat: element.center.lat, lng: element.center.lon };
            } else if (element.lat && element.lon) {
                return { lat: element.lat, lng: element.lon };
            }
            return null;
        }).filter(Boolean); // Filter out invalid entries
    } catch (error) {
        console.error("Error fetching hazardous feature data:", error);
        return [];
    }
}

// Initialize the map with user's geolocation
async function initMap(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const accuracy = position.coords.accuracy; // Accuracy in meters

    // Initialize map centered on user's location
    const map = L.map('map').setView([userLat, userLng], 15);

    // OpenStreetMap standard tiles
    const normalLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Esri satellite tiles
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; GIS User Community',
    });

    // Add layer control for switching map views
    L.control.layers({ "Normal View": normalLayer, "Satellite View": satelliteLayer }).addTo(map);

    // Add a blue circle for the user’s location accuracy (PULSATING EFFECT)
    let userLocationCircle = L.circle([userLat, userLng], {
        color: '#4285F4', // Google Maps blue
        fillColor: '#4285F4',
        fillOpacity: 0.3, // Enhanced visibility
        radius: accuracy
    }).addTo(map);

    // Add a solid blue dot at the center (LARGER & BOLDER)
    let blueDot = L.circleMarker([userLat, userLng], {
        radius: 8, // Bigger for better visibility
        color: '#4285F4',
        fillColor: '#4285F4',
        fillOpacity: 1,
        weight: 2 // Bolder border
    }).addTo(map);

    // Animate the circle to create a pulsating effect
    function animateCircle() {
        let growing = true;
        setInterval(() => {
            let newRadius = growing ? userLocationCircle.getRadius() * 1.15 : userLocationCircle.getRadius() * 0.85;
            userLocationCircle.setRadius(newRadius);
            growing = !growing;
        }, 800); // Adjust speed of animation
    }
    animateCircle();

    // Fetch sensor data
    const pinnedLocations = await fetchSensorData();

    // Add Sensor Markers and Affected Areas
    pinnedLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        marker.bindPopup(`
            ${location.label}<br>
            Status: ${location.status}<br>
            Rainfall: ${location.rainfall} mm<br>
            Soil Saturation: ${location.soil_saturation}%<br>
            Slope: ${location.slope}°<br>
            Seismic Activity: ${location.seismic_activity}<br>
            Soil Type: ${location.soil_type}<br>
            Risk Level: ${location.risk}<br>
            Predicted Landslide Time: ${location.predicted_landslide_time || "No prediction available"}
        `);

        // Highlight affected area based on risk level
        if (location.status === 'Alert') {
            // High-risk areas remain RED
            L.circle([location.lat, location.lng], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: location.affectedRadius
            }).addTo(map);

            // Add a flashing danger sign
            const dangerSign = L.divIcon({
                className: 'danger-sign',
                html: '⚠️',
                iconSize: [30, 30]
            });
            L.marker([location.lat, location.lng], { icon: dangerSign }).addTo(map);
        } else if (location.status === 'Warning') {
            // Medium-risk areas are YELLOW
            L.circle([location.lat, location.lng], {
                color: 'orange',
                fillColor: '#ffcc00',
                fillOpacity: 0.5,
                radius: location.affectedRadius
            }).addTo(map);
        }
    });

    // Update Sensor Details Table
    const sensorTableBody = document.getElementById('sensor-table-body');
    pinnedLocations.forEach(location => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${location.label.split(":")[0].trim()}</td>
            <td><span style="color: ${location.status === 'Alert' ? 'red' : location.status === 'Warning' ? 'orange' : 'green'};">${location.status}</span></td>
            <td>${location.rainfall}</td>
            <td>${location.forecasted_rainfall}</td>
            <td>${location.soil_saturation}</td>
            <td>${location.slope}</td>
            <td>${location.seismic_activity}</td>
            <td>${location.soil_type}</td>
            <td>${location.risk}</td>
            <td>${location.predicted_landslide_time || "No prediction available"}</td>
        `;
        sensorTableBody.appendChild(row);
    });

    // Alert System
    const alertMessage = document.getElementById('alert-message');
    const alertSound = document.getElementById('alert-sound');
    const alertBox = document.getElementById('alert-box');

    function triggerAlert(location, distance) {
        // Create alert item
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <p><strong>${location.label}</strong></p>
            <p>Status: ${location.status}</p>
            <p>Predicted Landslide Time: ${location.predicted_landslide_time || "No prediction available"}</p>
            <p>Distance: ${distance.toFixed(2)} km away</p>
        `;
        alertBox.appendChild(alertItem);

        // Play alert sound
        alertSound.play();

        // Redirect map view to the danger area
        map.setView([location.lat, location.lng], 15); // Zoom level 15 for closer view

        // Open the sensor's popup
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        marker.bindPopup(`
            ${location.label}<br>
            Status: ${location.status}<br>
            Rainfall: ${location.rainfall} mm<br>
            Soil Saturation: ${location.soil_saturation}%<br>
            Slope: ${location.slope}°<br>
            Seismic Activity: ${location.seismic_activity}<br>
            Soil Type: ${location.soil_type}<br>
            Risk Level: ${location.risk}<br>
            Predicted Landslide Time: ${location.predicted_landslide_time || "No prediction available"}
        `).openPopup();
    }

    // Simulate alerts after 5 seconds
    setTimeout(() => {
        const alertLocations = pinnedLocations.filter(location => location.status === 'Alert');

        // Calculate distances and find the nearest danger
        let nearestDanger = null;
        let minDistance = Infinity;
        alertLocations.forEach(location => {
            const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestDanger = location;
            }
            triggerAlert(location, distance);
        });

        // Redirect to the nearest danger
        if (nearestDanger) {
            map.setView([nearestDanger.lat, nearestDanger.lng], 15);
        }
    }, 5000);

 // Traffic Simulation and Evacuation Routes
async function simulateTrafficAndEvacuationRoutes(pinnedLocations, userLat, userLng) {
    // Define unsafe areas
    const unsafeAreas = pinnedLocations.filter(location => location.status === 'Alert' || location.status === 'Warning');

    // Draw unsafe areas on the map
    unsafeAreas.forEach(area => {
        L.circle([area.lat, area.lng], {
            color: area.status === 'Alert' ? 'red' : 'orange',
            fillColor: area.status === 'Alert' ? '#f03' : '#ffcc00',
            fillOpacity: 0.5,
            radius: area.affectedRadius
        }).addTo(map);
    });

    // Dynamically identify safe zones
    let nearestSafeZone = null;
    let minSafeDistance = Infinity;
    let searchRadius = 5; // Start with a 5 km search radius
    const maxSearchRadius = 50; // Maximum search radius (50 km)

    while (!nearestSafeZone && searchRadius <= maxSearchRadius) {
        for (let i = 0; i < 360; i += 45) { // Check 8 directions around the user
            const angle = (i * Math.PI) / 180;
            const safeLat = userLat + (searchRadius / 111) * Math.cos(angle);
            const safeLng = userLng + (searchRadius / (111 * Math.cos(userLat * (Math.PI / 180)))) * Math.sin(angle);

            // Check if this point is outside all unsafe areas with dynamic safety buffer
            let isSafe = true;
            for (const area of unsafeAreas) {
                const distanceToArea = calculateDistance(safeLat, safeLng, area.lat, area.lng);
                const safetyBuffer = Math.max(10, area.affectedRadius / 1000); // Dynamic buffer: at least 10 km or the impact radius
                if (distanceToArea <= safetyBuffer) { // Exclude points within the safety buffer
                    isSafe = false;
                    break;
                }
            }

            // Check if this point is near hazardous features
            if (isSafe) {
                const hazardousFeatures = await fetchHazardousFeatures(safeLat, safeLng, 2); // 2 km radius for hazard exclusion
                for (const hazard of hazardousFeatures) {
                    const distanceToHazard = calculateDistance(safeLat, safeLng, hazard.lat, hazard.lng);
                    if (distanceToHazard <= 1) { // Exclude points within 1 km of hazardous features
                        isSafe = false;
                        break;
                    }
                }
            }

            if (isSafe) {
                const distanceToUser = calculateDistance(userLat, userLng, safeLat, safeLng);
                if (distanceToUser < minSafeDistance) {
                    minSafeDistance = distanceToUser;
                    nearestSafeZone = { lat: safeLat, lng: safeLng };
                }
            }
        }

        // Expand search radius if no safe zone is found
        searchRadius += 5;
    }

    if (nearestSafeZone) {
        // Use Nominatim API to get the name of the safe zone area
        const safeZoneName = await fetchSafeZoneName(nearestSafeZone.lat, nearestSafeZone.lng);

        // Use OSRM API to calculate the shortest route along roads
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${nearestSafeZone.lng},${nearestSafeZone.lat}?geometries=geojson&steps=true`;
        try {
            const response = await fetch(osrmUrl);
            const data = await response.json();

            if (data && data.routes && data.routes.length > 0) {
                const routeCoordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const polyline = L.polyline(routeCoordinates, { color: 'green' }).addTo(map);

                // Fit the map to show the entire route
                map.fitBounds(polyline.getBounds());

                // Add a circular safe zone at the endpoint
                L.circle([nearestSafeZone.lat, nearestSafeZone.lng], {
                    color: 'green',
                    fillColor: '#32CD32',
                    fillOpacity: 0.5,
                    radius: 1000 // 1 km radius for the safe zone
                }).addTo(map);

                // Add a marker for the safe zone
                L.marker([nearestSafeZone.lat, nearestSafeZone.lng], {
                    icon: L.divIcon({
                        className: 'safe-sign',
                        html: '✅',
                        iconSize: [30, 30]
                    })
                }).addTo(map);

                // Display evacuation instructions with the safe zone name
                const routeInfo = document.getElementById('route-info');
                routeInfo.innerHTML = `
                    <p><strong>Evacuate to:</strong> ${safeZoneName || "Unknown Area"}</p>
                    <p><strong>Distance:</strong> ${minSafeDistance.toFixed(2)} km</p>
                    <p><strong>Route:</strong> Follow the green line on the map.</p>
                `;
            } else {
                const routeInfo = document.getElementById('route-info');
                routeInfo.innerHTML = `<p>No safe route found. Please stay cautious!</p>`;
            }
        } catch (error) {
            console.error("Error fetching route data from OSRM:", error);
            const routeInfo = document.getElementById('route-info');
            routeInfo.innerHTML = `<p>Failed to calculate evacuation route. Please try again later.</p>`;
        }
    } else {
        const routeInfo = document.getElementById('route-info');
        routeInfo.innerHTML = `<p>No safe zones found within ${maxSearchRadius} km. Please stay cautious!</p>`;
    }
}

// Fetch the name of the safe zone area using Nominatim API
async function fetchSafeZoneName(lat, lng) {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    try {
        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'Landslide-Evacuation-System' // Required by Nominatim usage policy
            }
        });
        const data = await response.json();

        if (data && data.address) {
            // Prioritize town, village, or city name
            return data.address.town || data.address.village || data.address.city || data.display_name.split(',')[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching safe zone name from Nominatim:", error);
        return null;
    }
}
    // Simulate traffic and evacuation routes after 10 seconds
    setTimeout(() => {
        simulateTrafficAndEvacuationRoutes(pinnedLocations, userLat, userLng);
    }, 10000);

    
}

// Show geolocation errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Automatically initialize map on page load
document.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});