// Typewriter Text Loop
const texts = ["Lets's save!", "Protect Lives!"];
let textIndex = 0; // Tracks the current text
const typewriterElement = document.querySelector('.typewriter-text');

function typeWriter(text, element, callback) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i); // Add one character at a time
      i++;
    } else {
      clearInterval(interval); // Stop typing
      setTimeout(() => {
        eraseText(element, callback); // Call erasing function
      }, 2000); // Wait 2 seconds before erasing
    }
  }, 100); // Adjust typing speed (100ms per character)
}

function eraseText(element, callback) {
  let text = element.textContent;
  const interval = setInterval(() => {
    if (text.length > 0) {
      text = text.slice(0, -1); // Remove one character at a time
      element.textContent = text;
    } else {
      clearInterval(interval); // Stop erasing
      callback(); // Call the callback to type the next text
    }
  }, 50); // Adjust erasing speed (50ms per character)
}

function startTypewriter() {
  const currentText = texts[textIndex];
  typeWriter(currentText, typewriterElement, () => {
    textIndex = (textIndex + 1) % texts.length; // Cycle through texts
    startTypewriter(); // Loop back to the next text
  });
}

// Start the typewriter effect on page load
document.addEventListener('DOMContentLoaded', () => {
  startTypewriter();
});

// Fake Data for People in Camp
const people = [];
for (let i = 1; i <= 30; i++) {
  people.push({
    id: `P${i}`,
    name: `Person ${i}`,
    contact: `+123 456 789${i}`,
    place: `Place ${i}`,
  });
}

// Populate People List
// const peopleList = document.getElementById('people-list');
// people.forEach(person => {
//   const li = document.createElement('li');
//   li.innerHTML = `
//     <strong>ID:</strong> ${person.id}<br>
//     <strong>Name:</strong> ${person.name}<br>
//     <strong>Contact:</strong> ${person.contact}<br>
//     <strong>Place:</strong> ${person.place}
//   `;
//   peopleList.appendChild(li);
// });

document.addEventListener("DOMContentLoaded", function () {
    fetch('/camp_manager/get_people')
        .then(response => response.json())
        .then(data => {
            const peopleList = document.getElementById("people-list");
            peopleList.innerHTML = ""; // Clear existing list
            data.forEach(person => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>ID:</strong> ${person.uid}<br>
                    <strong>Name:</strong> ${person.username}<br>
                    <strong>Contact:</strong> ${person.mobilet}<br>
                    <strong>Place:</strong> ${person.location}
                  `;
                peopleList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching people:", error));
});

// Fake Data for User Requests
const requests = [];
for (let i = 1; i <= 5; i++) {
  requests.push({
    id: `R${i}`,
    user: `User ${i}`,
    request: `Request ${i}`,
  });
}

// Populate Requests List
const requestsList = document.getElementById('requests-list');
requests.forEach(request => {
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>User:</strong> ${request.user}<br>
    <strong>Request:</strong> ${request.request}<br>
    <button class="accept">Accept</button>
    <button class="decline">Decline</button>
  `;
  requestsList.appendChild(li);
});

// People Capacity Doughnut Chart
const peopleCapacityChart = new Chart(document.getElementById('peopleCapacityChart'), {
  type: 'doughnut',
  data: {
    labels: ['Current', 'Remaining'],
    datasets: [{
      data: [120, 80], // Current: 120, Remaining: 80
      backgroundColor: ['#2575fc', '#ff6f61'], // Blue and Baby Pink
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom', // Move legend to the bottom
      },
    },
  },
});

// Resource Usage Bar Chart
const resourceChart = new Chart(document.getElementById('resourceChart'), {
  type: 'bar',
  data: {
    labels: ['Food', 'Water', 'Clothes', 'Essentials'],
    datasets: [{
      label: 'Resource Usage',
      data: [500, 3000, 200, 150],
      backgroundColor: ['#2575fc', '#6a11cb', '#ff6f61', '#28a745'],
    }],
  },
});

// Requests Over Time Line Chart
const requestsChart = new Chart(document.getElementById('requestsChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Requests Over Time',
      data: [10, 20, 15, 25, 30],
      borderColor: '#ff6f61',
      fill: false,
    }],
  },
});

// Supply Request Form
document.getElementById('send-supply-request').addEventListener('click', () => {
  const food = document.getElementById('food').value;
  const water = document.getElementById('water').value;
  const essentials = document.getElementById('essentials').value;
  const clothes = document.getElementById('clothes').value;

  alert(`Request Sent:\nFood: ${food} kg\nWater: ${water} L\nEssentials: ${essentials} kits\nClothes: ${clothes} sets`);
});