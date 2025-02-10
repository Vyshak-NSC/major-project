// Sample Data for Multiple Camps
const camps = [
    {
        id: "001",
        location: "Wayanad - Kalpetta",
        status: "Operational",
        capacity: 500,
        food: 2000,
        water: 10000,
        contact: "+123 456 7890",
        coordinates: { lat: 11.7401, lng: 76.1398 }, // Wayanad - Kalpetta
        people: ["John Doe", "Jane Smith", "Alice Johnson"]
    },
    {
        id: "002",
        location: "Wayanad - Sulthan Bathery",
        status: "Under Maintenance",
        capacity: 300,
        food: 1500,
        water: 8000,
        contact: "+987 654 3210",
        coordinates: { lat: 11.6645, lng: 76.2644 }, // Wayanad - Sulthan Bathery
        people: ["Bob Brown", "Emily Davis"]
    },
    {
        id: "003",
        location: "Wayanad - Mananthavady",
        status: "Operational",
        capacity: 700,
        food: 2500,
        water: 12000,
        contact: "+555 555 5555",
        coordinates: { lat: 11.8249, lng: 76.0882 }, // Wayanad - Mananthavady
        people: ["Michael Lee", "Sarah Wilson"]
    }
];

let currentCampIndex = 0;
let map;

// Initialize Map
function initMap() {
    const currentCamp = camps[currentCampIndex];
    const center = [currentCamp.coordinates.lat, currentCamp.coordinates.lng];

    // Initialize Leaflet map
    map = L.map("map").setView(center, 12);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker for the camp location
    L.marker(center).addTo(map)
        .bindPopup(currentCamp.location)
        .openPopup();
}

// Update Map and Directions Button
function updateMap() {
    const currentCamp = camps[currentCampIndex];
    const center = [currentCamp.coordinates.lat, currentCamp.coordinates.lng];

    // Center the map on the new location
    map.setView(center, 12);

    // Remove existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add a new marker for the camp location
    L.marker(center).addTo(map)
        .bindPopup(currentCamp.location)
        .openPopup();

    // Update Directions Button
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

// Update Camp Details on Page
function updateCampDetails() {
    const currentCamp = camps[currentCampIndex];
    document.getElementById("camp-id").textContent = currentCamp.id;
    document.getElementById("camp-location").textContent = currentCamp.location;
    document.getElementById("camp-status").textContent = currentCamp.status;
    document.getElementById("camp-capacity").textContent = `${currentCamp.capacity} people`;
    document.getElementById("camp-food").textContent = `${currentCamp.food} meals`;
    document.getElementById("camp-water").textContent = `${currentCamp.water} liters`;
    document.getElementById("camp-contact").textContent = currentCamp.contact;

    // Update Chart
    initializeChart(currentCamp.food, currentCamp.water);

    // Update Map
    updateMap();
}

// Next Camp Button
document.getElementById("next-camp-btn").addEventListener("click", () => {
    currentCampIndex = (currentCampIndex + 1) % camps.length;
    updateCampDetails();
});

// Request Supplies Button
document.getElementById("request-btn").addEventListener("click", () => {
    const currentCamp = camps[currentCampIndex];
    const supplies = prompt(
        `Enter supplies needed for Camp ${currentCamp.id} (${currentCamp.location}) in the format:\nfood,water,clothes,essentials\n(e.g., 500,2000,100,50)`
    );

    if (supplies) {
        const [food, water, clothes, essentials] = supplies.split(",").map(Number);
        alert(
            `Request Submitted:\nCamp ID: ${currentCamp.id}\nLocation: ${currentCamp.location}\nSupplies Requested:\n- Food: ${food} meals\n- Water: ${water} liters\n- Clothes: ${clothes} units\n- Essentials: ${essentials} units`
        );
    } else {
        alert("No supplies requested.");
    }
});

// Search Functionality
document.getElementById("search-btn").addEventListener("click", () => {
    const searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    const currentCamp = camps[currentCampIndex];
    const result = currentCamp.people.find((person) => person.toLowerCase() === searchInput);

    const searchResult = document.getElementById("search-result");
    if (result) {
        searchResult.textContent = `${result} is currently registered at Camp ${currentCamp.id} (${currentCamp.location}).`;
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

// Initialize First Camp on Page Load
initMap();
updateCampDetails();

// Function to reset a dropdown to its default state
function resetDropdown(dropdown) {
    dropdown.innerHTML = '<option value="" disabled selected>Select a Camp</option>' +
        '<option value="Camp A">Camp A</option>' +
        '<option value="Camp B">Camp B</option>' +
        '<option value="Camp C">Camp C</option>';
}

// Function to filter and display only the remaining camps
function filterAndDisplayOptions(dropdown, excludedValues) {
    // Reset the dropdown to its default state
    resetDropdown(dropdown);

    // Remove options that are excluded
    Array.from(dropdown.options).forEach(option => {
        if (excludedValues.includes(option.value)) {
            option.remove(); // Remove the excluded option
        }
    });
}

// Event Listener for priority1
document.getElementById("priority1").addEventListener("change", function () {
    const selectedValue1 = this.value; // Get the selected value from priority1
    const priority2 = document.getElementById("priority2");
    const priority3 = document.getElementById("priority3");

    // Reset priority2 and priority3 dropdowns
    resetDropdown(priority2);
    resetDropdown(priority3);

    // Filter out the selected value from priority1
    if (selectedValue1) {
        filterAndDisplayOptions(priority2, [selectedValue1]);
        filterAndDisplayOptions(priority3, [selectedValue1]);
    }
});

// Event Listener for priority2
document.getElementById("priority2").addEventListener("change", function () {
    const selectedValue1 = document.getElementById("priority1").value; // Get the selected value from priority1
    const selectedValue2 = this.value; // Get the selected value from priority2
    const priority3 = document.getElementById("priority3");

    // Reset priority3 dropdown
    resetDropdown(priority3);

    // Filter out the selected values from priority1 and priority2
    if (selectedValue1 || selectedValue2) {
        const excludedValues = [];
        if (selectedValue1) excludedValues.push(selectedValue1);
        if (selectedValue2) excludedValues.push(selectedValue2);
        filterAndDisplayOptions(priority3, excludedValues);
    }
});