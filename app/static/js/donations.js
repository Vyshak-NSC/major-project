// const ctx = document.getElementById('myChart').getContext('2d');
// const myChart = new Chart(ctx, {
//     type: 'doughnut',
//     data: {
//         labels: ['Received', 'Spent'],
//         datasets: [{
//             data: [75, 25],
//             backgroundColor: ['#007bff', '#ff6384'],
//         }]
//     },
//     options: {
//         legend: {
//             display: false
//         }
//     }
// });


// Show/hide essential form popup
const essentialBtn = document.getElementById('essential-btn');
const essentialFormPopup = document.getElementById('essential-form-popup');
const closeBtn = document.querySelector('.close-btn');

essentialBtn.addEventListener('click', () => {
    essentialFormPopup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    essentialFormPopup.style.display = 'none';
});
 // Function to add a new item group
 document.getElementById('add-item-btn').addEventListener('click', function() {
    const container = document.getElementById('items-container');
    const newItemGroup = document.createElement('div');
    newItemGroup.classList.add('item-group');

    newItemGroup.innerHTML = `
        <label for="item">Item:</label>
        <input type="text" class="item-name" name="item[]" required>

        <label for="quantity">Quantity:</label>
        <input type="number" class="item-quantity" name="quantity[]" min="1" required>

        <label for="condition">Condition:</label>
        <select class="item-condition" name="condition[]">
            <option value="new">New</option>
            <option value="used">Used (Good)</option>
            <option value="used-fair">Used (Fair)</option>
        </select>

        <!-- Button to remove the item group -->
        <button type="button" class="remove-item-btn">Remove Item</button>
    `;

    container.appendChild(newItemGroup);
});

// Event delegation to handle removal of item groups
document.getElementById('items-container').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('remove-item-btn')) {
        e.target.parentElement.remove();
    }
});

// Ensure quantity cannot be negative
document.getElementById('essential-form').addEventListener('submit', function(e) {
    const quantities = document.querySelectorAll('.item-quantity');
    let isValid = true;

    quantities.forEach(quantity => {
        if (quantity.value <= 0) {
            alert('Quantity must be greater than zero.');
            isValid = false;
        }
    });

    if (!isValid) {
        e.preventDefault(); // Prevent form submission if validation fails
    }
});
// Close popup when clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target === essentialFormPopup) {
        essentialFormPopup.style.display = 'none';
    }
});

// submit donation form
document.getElementById('essential-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const items = document.querySelectorAll('.item-group');

    const itemData = [];
    items.forEach(item => {
        const name = item.querySelector('.item-name').value;
        const quantity = item.querySelector('.item-quantity').value;
        const condition = item.querySelector('.item-condition').value;

        itemData.push({ name, quantity, condition });
    });

    fetch('/user/donate_items', {
        method: 'POST',
        body: JSON.stringify({
            items: itemData
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Donation submitted successfully!');
        } else {
            alert('An error occurred. Please try again.');
            console.log(data.error);
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Fetch donation summary from the backend
    fetch('/user/donation-summary')
        .then(response => response.json())
        .then(data => {
            if (data) {
                const amountDonated = data.amount_donated; // Total monetary donation
                const itemsDonated = data.items_donated;   // List of donated items

                // Aggregate item quantities
                const itemSummary = {};
                itemsDonated.forEach(([itemName, quantity]) => {
                    if (itemSummary[itemName]) {
                        itemSummary[itemName] += parseInt(quantity, 10); // Sum up quantities
                    } else {
                        itemSummary[itemName] = parseInt(quantity, 10);
                    }
                });

                // Prepare labels and data for the bar chart
                const labels = Object.keys(itemSummary);
                const quantities = Object.values(itemSummary);

                // Update the Donation Bar Chart
                const ctx = document.getElementById('myChart').getContext('2d');
                const myChart = new Chart(ctx, {
                    type: 'bar', // Change to bar chart
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Quantity Donated",
                            data: quantities,
                            backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'], // Add more colors if needed
                            borderColor: '#000',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y', // Horizontal bar chart
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false // Hide legend since we only have one dataset
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.raw} units`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: "Quantity"
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: "Items"
                                }
                            }
                        }
                    }
                });

                // Update the amount donated label
                document.getElementById('amount-donated').textContent = `Amount Donated: ₹${amountDonated}`;

                // Update the items donated label
                if (labels.length > 0) {
                    const itemsList = labels.map((label, index) => `${label}: ${quantities[index]} units`).join(", ");
                    document.getElementById('items-donated').textContent = `Items Donated: ${itemsList}`;
                } else {
                    document.getElementById('items-donated').textContent = "Items Donated: None";
                }
            } else {
                console.error("Failed to fetch donation summary:", data.error);
            }
        })
        .catch(error => console.error("Error fetching donation summary:", error));
});