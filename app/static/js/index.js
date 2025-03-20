let camp_index = 0; // Start with index 0 for easier array access
let all_camps = []; // Store all camps data fetched from the server
let notificationIntervalId = null; // To store the interval ID for notifications

document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

// Initialize the page by setting up charts, fetching data, and event listeners
function initializePage() {
    setupCharts();
    fetchAllCampsData();
    setupEventListeners();
    setupWeather();
}

// Set up the Donation and Relief Camps charts
function setupCharts() {
    // Commenting out the Donation Pie Chart setup
    // setupDonationChart();
    setupReliefCampChart();
}

// Commenting out the Donation Pie Chart setup
// function setupDonationChart() {
//     const donationCtx = document.getElementById("myChart").getContext("2d");
//     new Chart(donationCtx, {
//         type: "doughnut",
//         data: {
//             labels: ["Donated", "Spent"],
//             datasets: [{
//                 data: [0, 0],
//                 backgroundColor: ["#007bff", "#ff6384"],
//             }],
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 tooltip: {
//                     enabled: true,
//                     callbacks: {
//                         label: function (context) {
//                             return `${context.label}: ${context.raw}Rs`;
//                         },
//                     },
//                 },
//             },
//         },
//     });
// }

// Set up the Relief Camps Chart
function setupReliefCampChart() {
    const campCtx = document.getElementById("campChart").getContext("2d");
    new Chart(campCtx, {
        type: "doughnut",
        data: {
            labels: ["Food Supply", "Water Supply"],
            datasets: [{
                label: "Relief Camp Inventory",
                data: [0, 0], // Initial data
                backgroundColor: ["#28a745", "#ffc107"],
                hoverBackgroundColor: ["#218838", "#e0a800"],
                borderWidth: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: "right",
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const labels = ["meals", "liters"];
                            return `${context.label}: ${context.raw} ${labels[context.dataIndex]}`;
                        },
                    },
                },
            },
            animation: {
                animateScale: true,
                animateRotate: true,
            },
        },
    });
}

// Set up event listeners for buttons and interactions
function setupEventListeners() {
    document.querySelector(".next-camp-btn").addEventListener("click", handleNextCampClick);
    document.getElementById('chatbot-icon').addEventListener('click', toggleChatbot);
    document.getElementById('chatbot-close').addEventListener('click', closeChatbot);
    document.querySelector('.refresh-btn').addEventListener('click', refreshWeather);
}

// Handle the "Next Camp" button click
function handleNextCampClick() {
    camp_index = (camp_index + 1) % all_camps.length; // Cycle through camps
    console.log("Next camp button clicked:", camp_index); // Debugging log
    updateCampDetailsAndChart(all_camps[camp_index]);
}

// Toggle the chatbot popup
function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'block' : 'none';
        console.log("Chatbot toggled"); // Debugging log
    } else {
        console.error("Chatbot container not found");
    }
}

// Close the chatbot popup
function closeChatbot() {
    const chatbotContainer = document.getElementById('chatbot-container');
    if (chatbotContainer) {
        chatbotContainer.style.display = 'none';
        console.log("Chatbot closed"); // Debugging log
    } else {
        console.error("Chatbot container not found");
    }
}

// Refresh weather data
function refreshWeather() {
    getLocation();
    alert('Weather data refreshed!');
}

// Set up weather-related functionality
function setupWeather() {
    window.onload = function () {
        getLocation(); // Fetch weather data on page load
        setInterval(getLocation, 300000); // Refresh weather every 5 minutes (300,000ms)
    };
}

// Fetch location and weather data
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeather, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch weather data based on geolocation
function getWeather(position) {
    const apiKey = "b5dab13c4329459e80660419250202"; // Replace with your WeatherAPI API key
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.location) {
                document.getElementById("location").innerText = ` ${data.location.name}, ${data.location.country}`;
                document.getElementById("weather").innerText = ` ${data.current.temp_c}°C`;
                document.getElementById("condition").innerText = ` ${data.current.condition.text}`;
                document.getElementById("humidity").innerText = ` ${data.current.humidity}%`;
            } else {
                document.getElementById("location").innerText = "Location not found. Please try again.";
            }
        })
        .catch(error => console.error("Error fetching weather data:", error));
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

// Fetch all camps data from the server
async function fetchAllCampsData() {
    try {
        const response = await fetch('/user/list_all_camps');
        if (!response.ok) {
            throw new Error("Failed to fetch camps data");
        }
        all_camps = await response.json();
        console.log("Fetched all camps data:", all_camps);
        if (all_camps.length > 0) {
            updateCampDetailsAndChart(all_camps[camp_index]);
        } else {
            console.error("No camps data available");
        }
    } catch (error) {
        console.error("Error fetching camps data:", error);
    }
}

// Update camp details and chart with the selected camp's data
function updateCampDetailsAndChart(camp) {
    clearNotificationInterval();
    updateCampDetailsUI(camp);
    updateReliefCampChart(camp);
    // Commenting out the Donation Chart update
    // updateDonationChart(camp);
    fetchAndDisplayNotifications(camp.cid);
    startNotificationRefresh(camp.cid);
}

// Clear the previous notification interval
function clearNotificationInterval() {
    if (notificationIntervalId) {
        clearInterval(notificationIntervalId);
    }
}

// Update camp details in the UI
function updateCampDetailsUI(camp) {
    document.getElementById("camp-capacity").textContent = `${camp.num_people_present}/${camp.capacity}`;
    document.getElementById("food-supply").textContent = `${camp.food_stock_quota} Meals`;
    document.getElementById("water-supply").textContent = `${camp.water_stock_litres} Litres`;
    document.getElementById("camp-location").textContent = `${camp.location}`;
}

// Update the Relief Camps Chart
function updateReliefCampChart(camp) {
    const campChart = Chart.getChart("campChart"); // Get the existing chart instance
    if (campChart) {
        campChart.data.datasets[0].data = [
            camp.food_stock_quota,
            camp.water_stock_litres
        ];
        campChart.update();
        console.log("Camp chart updated");
    } else {
        console.error("Camp chart not initialized");
    }
}

// Commenting out the Donation Chart update
// function updateDonationChart(camp) {
//     const donationChart = Chart.getChart("myChart"); // Get the existing chart instance
//     if (donationChart) {
//         donationChart.data.datasets[0].data = [
//             camp.donations_received,
//             camp.donations_spent
//         ];
//         donationChart.update();
//         console.log("Donation chart updated");
//     } else {
//         console.error("Donation chart not initialized");
//     }
// }

// Fetch and display notifications for a specific camp
async function fetchAndDisplayNotifications(camp_id) {
    try {
        const response = await fetch(`/user/camp_notification/${camp_id}`);
        if (!response.ok) {
            throw new Error("Failed to fetch notifications");
        }
        const notifications = await response.json();
        const notifList = document.getElementById('notification-content');
        notifList.innerHTML = '';
        if (notifications.length === 0) {
            notifList.innerHTML = `<li>No announcements</li>`;
        } else {
            notifications.forEach(n => {
                const item = document.createElement('li');
                item.textContent = n.message;
                notifList.appendChild(item);
            });
        }
        console.log(`Fetched notifications for camp ${camp_id}`);
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

// Start periodic notification refresh
function startNotificationRefresh(camp_id) {
    notificationIntervalId = setInterval(() => {
        fetchAndDisplayNotifications(camp_id);
    }, 10000);
}