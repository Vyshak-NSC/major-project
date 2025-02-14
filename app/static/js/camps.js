let camps = [];  // Ensure `camps` is initialized as an empty array
let currentCampIndex = 0;
let map;

// Fetch Camps from Backend
async function fetchCamps() {
    try {
        const response = await fetch('/list_all_camps');
        if (!response.ok) {
            throw new Error("Failed to fetch camp data");
        }

        camps = await response.json();
        console.log("Fetched camps:", camps);

        if (!Array.isArray(camps) || camps.length === 0) {
            alert("No camps available.");
            return;
        }

        currentCampIndex = 0;  // Reset index
        initMap(camps[currentCampIndex]);  // Initialize map with first camp
        updateCampDetails(camps);
    } catch (error) {
        console.error("Error fetching camps:", error);
        alert("Error fetching camps.");
    }
}

// Initialize Map (After Fetching Data)
function initMap(camp) {
    if (!camp || !camp.coordinates) {
        console.error("Invalid camp data for map initialization.");
        return;
    }

    const center = [camp.coordinates.lat, camp.coordinates.lng];

    map = L.map("map").setView(center, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(center).addTo(map)
        .bindPopup(camp.location)
        .openPopup();
}

// Update Map
function updateMap(camps) {
    if (!camps || camps.length === 0) {
        console.error("No camp data available for map update.");
        return;
    }

    const currentCamp = camps[currentCampIndex];
    if (!currentCamp || !currentCamp.coordinates) {
        console.error("Invalid camp data for map update.");
        return;
    }

    const center = [currentCamp.coordinates.lat, currentCamp.coordinates.lng];

    map.setView(center, 12);

    // Remove existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    L.marker(center).addTo(map)
        .bindPopup(currentCamp.location)
        .openPopup();

    document.getElementById("directions-btn").onclick = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`, "_blank");
    };
}

// Initialize Chart
let resourcesChart;

function initializeChart(food, water) {
    const ctx = document.getElementById("resources-chart").getContext("2d");
    if (resourcesChart) resourcesChart.destroy();

    resourcesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Food (meals)", "Water (liters)"],
            datasets: [
                {
                    label: "Resources Available",
                    data: [food, water],
                    backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)"],
                    borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update Camp Details
function updateCampDetails(camps) {
    if (!camps || camps.length === 0) {
        console.error("No camps available for display.");
        return;
    }

    const currentCamp = camps[currentCampIndex];

    if (!currentCamp) {
        console.error("Invalid camp data.");
        return;
    }

    document.getElementById("camp-id").textContent = currentCamp.cid || "N/A";
    document.getElementById("camp-location").textContent = currentCamp.location || "N/A";
    document.getElementById("camp-status").textContent = currentCamp.status || "N/A";
    document.getElementById("camp-capacity").textContent = `${currentCamp.num_people_present || 0} / ${currentCamp.capacity || 0} people`;
    document.getElementById("camp-food").textContent = `${currentCamp.food_stock_quota || 0} meals`;
    document.getElementById("camp-water").textContent = `${currentCamp.water_stock_litres || 0} liters`;
    document.getElementById("camp-contact").textContent = currentCamp.contact_number || "N/A";

    initializeChart(currentCamp.food_stock_quota, currentCamp.water_stock_litres);
    updateMap(camps);
}

// Next Camp Button
document.getElementById("next-camp-btn").addEventListener("click", () => {
    if (!camps || camps.length === 0) {
        console.error("No camps available.");
        return;
    }

    currentCampIndex = (currentCampIndex + 1) % camps.length;
    // console.log("Switching to camp:", camps[currentCampIndex]);
    updateCampDetails(camps);
});

// Previous camp button
document.getElementById("prev-camp-btn").addEventListener("click", () => {
    if (!camps || camps.length === 0) {
        console.error("No camps available.");
        return;
    }

    // Move to the previous camp (loops to the last camp if at the first)
    currentCampIndex = (currentCampIndex - 1 + camps.length) % camps.length;
    console.log("Switching to previous camp:", camps[currentCampIndex]);
    updateCampDetails(camps);
});

// Fetch Camps on Page Load
fetchCamps();
