// Chart.js Configuration for Donation Pie Chart
document.addEventListener("DOMContentLoaded", function () {
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
                data: [200, 80, 70],
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
                            const labels = ["people", "kg", "liters"];
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
        console.log("Next camp button clicked"); // Debugging log

        // Update camp details
        document.getElementById("camp-capacity").textContent = "300";
        document.getElementById("available-people").textContent = "250";
        document.getElementById("food-supply").textContent = "90%";
        document.getElementById("water-supply").textContent = "85%";
        document.getElementById("camp-location").textContent = "Region B";

        // Update chart data
        if (campChart) {
            campChart.data.datasets[0].data = [300, 90, 85];
            campChart.update();
            console.log("Camp chart updated"); // Debugging log
        } else {
            console.error("Camp chart not initialized");
        }
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