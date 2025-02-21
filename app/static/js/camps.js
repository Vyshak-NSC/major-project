// Global Variables
let camps = []; // Ensure `camps` is initialized as an empty array
let currentCampIndex = 0;
let map;

// Fetch Camps from Backend
async function fetchCamps() {
    try {
        const response = await fetch('/user/list_all_camps');
        if (!response.ok) {
            throw new Error("Failed to fetch camp data");
        }

        camps = await response.json();
        console.log("Fetched camps:", camps);

        if (!Array.isArray(camps) || camps.length === 0) {
            alert("No camps available.");
            return;
        }

        initializeAppWithCamps();
    } catch (error) {
        console.error("Error fetching camps:", error);
        alert("Error fetching camps.");
    }
}

// Initialize App with Fetched Camps
function initializeAppWithCamps() {
    currentCampIndex = 0; // Reset index
    initMap(camps[currentCampIndex]); // Initialize map with first camp
    updateCampDetails(camps);
}

// Initialize Map
function initMap(camp) {
    if (!camp || !camp.coordinates) {
        console.error("Invalid camp data for map initialization.");
        return;
    }

    const center = [camp.coordinates.lat, camp.coordinates.lng];

    map = L.map("map").setView(center, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors'
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

    if (typeof currentCampIndex === "undefined" || currentCampIndex >= camps.length) {
        console.error("Invalid currentCampIndex:", currentCampIndex);
        return;
    }

    const currentCamp = camps[currentCampIndex];
    if (!currentCamp || !currentCamp.coordinates) {
        console.error("Invalid camp data for map update.");
        return;
    }

    console.log("Updating map for camp:", currentCamp);

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
    updateCampDetails(camps);
});

// Previous Camp Button
document.getElementById("prev-camp-btn").addEventListener("click", () => {
    if (!camps || camps.length === 0) {
        console.error("No camps available.");
        return;
    }

    currentCampIndex = (currentCampIndex - 1 + camps.length) % camps.length;
    updateCampDetails(camps);
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

// Show/Hide Request Form Popup
const requestSlotBtn = document.getElementById('request-slot-btn');
const requestFormPopup = document.getElementById('request-form-popup');
const closeBtn = document.querySelector('.close-btn');

requestSlotBtn.addEventListener('click', () => {
    requestFormPopup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    requestFormPopup.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === requestFormPopup) {
        requestFormPopup.style.display = 'none';
    }
});

// Priority Dropdown Filtering
function resetDropdown(dropdown) {
    dropdown.innerHTML = `
        <option value="" disabled selected>Select a Camp</option>
        <option value="Camp A">Camp A</option>
        <option value="Camp B">Camp B</option>
        <option value="Camp C">Camp C</option>
    `;
}

function filterAndDisplayOptions(dropdown, excludedValues) {
    resetDropdown(dropdown);

    Array.from(dropdown.options).forEach(option => {
        if (excludedValues.includes(option.value)) {
            option.remove();
        }
    });
}

document.getElementById("priority1").addEventListener("change", function () {
    const selectedValue1 = this.value;
    const priority2 = document.getElementById("priority2");
    const priority3 = document.getElementById("priority3");

    resetDropdown(priority2);
    resetDropdown(priority3);

    if (selectedValue1) {
        filterAndDisplayOptions(priority2, [selectedValue1]);
        filterAndDisplayOptions(priority3, [selectedValue1]);
    }
});

document.getElementById("priority2").addEventListener("change", function () {
    const selectedValue1 = document.getElementById("priority1").value;
    const selectedValue2 = this.value;
    const priority3 = document.getElementById("priority3");

    resetDropdown(priority3);

    if (selectedValue1 || selectedValue2) {
        const excludedValues = [];
        if (selectedValue1) excludedValues.push(selectedValue1);
        if (selectedValue2) excludedValues.push(selectedValue2);
        filterAndDisplayOptions(priority3, excludedValues);
    }
});

// Fetch Camps on Page Load
fetchCamps();