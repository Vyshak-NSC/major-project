let currentCampIndex = 0;
let map;

// Initialize Map
function initMap(lat, lng, location) {
    const center = [lat, lng];
    map = L.map("map").setView(center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker(center).addTo(map)
        .bindPopup(location)
        .openPopup();
}

// Update Map and Directions Button
function updateMap(lat, lng, location) {
    const center = [lat, lng];
    map.setView(center, 12);
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    L.marker(center).addTo(map)
        .bindPopup(location)
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
            plugins: {
                legend: {
                    display: true,
                    position: "top"
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

//clear old camp data displayed
function clearCampDetails() {
    // Clear the chart
    if (resourcesChart) resourcesChart.destroy();

    // Clear the map
    if (map) {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        map.setView([0, 0], 2); // Reset map to a default view
    }
}

function showNoCampMessage() {
    const campDetailsSection = document.querySelector(".camp-details");
    campDetailsSection.innerHTML = `
        <h1>No camp set up</h1>
    `;
}

// Fetch All Camps and Display the First One
async function fetchAllCamps() {
    try {
        const response = await fetch("/list_all_camps");
        if (!response.ok) {
            throw new Error("Failed to fetch camps");
        }
        const camps = await response.json();

        // Check if there are no camps
        if (camps.length === 0) {
            showNoCampMessage(); // Show "No camp set up" message
            clearCampDetails(); // Clear all displayed data
            return;
        }

        // Store camps globally
        window.camps = camps;

        // Initialize the first camp
        displayCamp(camps[currentCampIndex]);
        initMap(camps[currentCampIndex].coordinates.lat, camps[currentCampIndex].coordinates.lng, camps[currentCampIndex].location);
    } catch (error) {
        console.error(error.message || "An error occurred while fetching camps.");
        showNoCampMessage(); // Show "No camp set up" message
        clearCampDetails(); // Clear all displayed data in case of an error
    }
}

// Display Camp Details on Page
function displayCamp(camp) {
    document.getElementById("camp-id").textContent = camp.cid;
    document.getElementById("camp-location").textContent = camp.location;
    document.getElementById("camp-status").textContent = camp.status;
    document.getElementById("camp-capacity").textContent = `${camp.num_people_present} / ${camp.capacity} people`;
    document.getElementById("camp-food").textContent = `${camp.food_stock_quota} meals`;
    document.getElementById("camp-water").textContent = `${camp.water_stock_litres} liters`;
    document.getElementById("camp-contact").textContent = camp.contact_number;

    // Update Announcements List
    const announcementsListElement = document.getElementById("announcements-list");
    announcementsListElement.innerHTML = "";
    camp.announcements.forEach(announcement => {
        const li = document.createElement("li");
        li.textContent = announcement;
        announcementsListElement.appendChild(li);
    });

    // Update Chart
    initializeChart(camp.food_stock_quota, camp.water_stock_litres);

    // Update Map
    updateMap(camp.coordinates.lat, camp.coordinates.lng, camp.location);
}

// Next Camp Button
document.getElementById("next-camp-btn").addEventListener("click", () => {
    currentCampIndex = (currentCampIndex + 1) % window.camps.length;
    displayCamp(window.camps[currentCampIndex]);
});

// Search Functionality
document.getElementById("search-btn").addEventListener("click", () => {
    const searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    const currentCamp = window.camps[currentCampIndex];
    const result = currentCamp.people_list.find(person => person.toLowerCase() === searchInput);
    const searchResult = document.getElementById("search-result");
    if (result) {
        searchResult.textContent = `${result} is currently registered at Camp ${currentCamp.cid} (${currentCamp.location}).`;
    } else {
        searchResult.textContent = "No matching records found.";
    }
});

// Show/hide request form popup
const requestSlotBtn = document.getElementById('request-slot-btn');
const requestFormPopup = document.getElementById('request-form-popup');
const closeBtn = document.querySelector('.close-btn');
requestSlotBtn.addEventListener('click', () => {
    requestFormPopup.style.display = 'flex';
});
closeBtn.addEventListener('click', () => {
    requestFormPopup.style.display = 'none';
});

// Close popup when clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target === requestFormPopup) {
        requestFormPopup.style.display = 'none';
    }
});

// Initialize Camps on Page Load
fetchAllCamps();