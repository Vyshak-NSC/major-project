let camp_index = 0; // Start with index 0 for easier array access
let all_camps = []; // Store all camps data fetched from the server

document.addEventListener("DOMContentLoaded", function () {
    // Fetch all camps data on page load
    fetchAllCampsData();

    // Donation Pie Chart
    const donationCtx = document.getElementById("myChart").getContext("2d");
    const donationChart = new Chart(donationCtx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [75, 25],
                backgroundColor: ["#007bff", "#ff6384"],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // Relief Camps Chart
    const campCtx = document.getElementById("campChart").getContext("2d");
    const campChart = new Chart(campCtx, {
        type: "doughnut",
        data: {
            labels: ["Capacity", "Food Supply", "Water Supply"],
            datasets: [{
                label: "Relief Camp Data",
                data: [120,120,120],
                backgroundColor: ["#007bff", "#28a745", "#ffc107"],
                hoverBackgroundColor: ["#005bb5", "#218838", "#e0a800"],
                borderWidth: 0,
            }]
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
                            const labels = ["people", "meals", "liters"];
                            return `${context.label}: ${context.raw} ${labels[context.dataIndex]}`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
            }
        }
    });

    // Next Camp Button Functionality
    document.querySelector(".next-camp-btn").addEventListener("click", function () {
        camp_index = (camp_index + 1) % all_camps.length; // Cycle through camps
        console.log("Next camp button clicked:", camp_index); // Debugging log

        // Update camp details and chart
        updateCampDetailsAndChart(all_camps[camp_index]);
    });

    // Refresh button for weather box
    document.querySelector('.refresh-btn').addEventListener('click', function () {
        getLocation(); // Refresh weather data
        alert('Weather data refreshed!');
    });

    // Automatically fetch weather on page load and refresh every 5 minutes
    window.onload = function () {
        getLocation(); // Fetch weather data on page load
        setInterval(getLocation, 300000); // Refresh weather every 5 minutes (300,000ms)
    };

    // Geolocation to get user's location
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

    // Chatbot Popup Toggle
    document.getElementById('chatbot-icon').addEventListener('click', function () {
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer) {
            chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'block' : 'none';
            console.log("Chatbot toggled"); // Debugging log
        } else {
            console.error("Chatbot container not found");
        }
    });

    // Close Chatbot Popup
    document.getElementById('chatbot-close').addEventListener('click', function () {
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer) {
            chatbotContainer.style.display = 'none';
            console.log("Chatbot closed"); // Debugging log
        } else {
            console.error("Chatbot container not found");
        }
    });
});

// Fetch all camps data from the server
async function fetchAllCampsData() {
    try {
        const response = await fetch('/user/list_all_camps');
        if (!response.ok) {
            throw new Error("Failed to fetch camps data");
        }
        all_camps = await response.json();
        console.log("Fetched all camps data:", all_camps);

        // Initialize with the first camp's data
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
    // Update camp details in the UI
    document.getElementById("camp-capacity").textContent = `${camp.num_people_present}/${camp.capacity}`;
    document.getElementById("available-people").textContent = `${camp.num_people_present}`;
    document.getElementById("food-supply").textContent = `${camp.food_stock_quota} Meals`;
    document.getElementById("water-supply").textContent = `${camp.water_stock_litres} Litres`;
    document.getElementById("camp-location").textContent = `${camp.location}`;

    // Update the Relief Camps Chart
    const campChart = Chart.getChart("campChart"); // Get the existing chart instance
    if (campChart) {
        campChart.data.datasets[0].data = [
            camp.capacity,
            camp.food_stock_quota,
            camp.water_stock_litres
        ];
        campChart.update();
        console.log("Camp chart updated");
    } else {
        console.error("Camp chart not initialized");
    }
}