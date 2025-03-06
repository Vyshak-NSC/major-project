// Typewriter Text Loop
const texts = ["Your contribution can save lives!", "Be the change!"];
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

// Fake Data for Requests from Camps
const requests = [
  {
    id: "R1",
    camp: "Camp A",
    food: "200 kg",
    water: "1000 L",
    essentials: "50 kits",
    clothes: "100 sets",
  },
  {
    id: "R2",
    camp: "Camp B",
    food: "150 kg",
    water: "800 L",
    essentials: "30 kits",
    clothes: "80 sets",
  },
  {
    id: "R3",
    camp: "Camp C",
    food: "300 kg",
    water: "1200 L",
    essentials: "40 kits",
    clothes: "120 sets",
  },
];

// Populate Requests List
const requestsList = document.getElementById('requests-list');
requests.forEach(request => {
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>Camp:</strong> ${request.camp}<br>
    <strong>Food:</strong> ${request.food}<br>
    <strong>Water:</strong> ${request.water}<br>
    <strong>Essentials:</strong> ${request.essentials}<br>
    <strong>Clothes:</strong> ${request.clothes}<br>
    <button class="accept">Accept</button>
    <button class="decline">Decline</button>
  `;
  requestsList.appendChild(li);
});

const availableResourcesChart = new Chart(document.getElementById('availableResourcesChart'), {
  type: 'bar',
  data: {
    labels: ['Food', 'Water', 'Clothes', 'Essentials'], // Resources
    datasets: [{
      label: 'Available Resources',
      data: [1500, 5000, 800, 400], // Available quantities
      backgroundColor: ['#2575fc', '#6a11cb', '#ff6f61', '#28a745'], // Colors for each bar
    }],
  },
  options: {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`; // Display the available quantity in tooltips
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity', // Y-axis label
        },
      },
      x: {
        title: {
          display: true,
          text: 'Resources', // X-axis label
        },
      },
    },
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