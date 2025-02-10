const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Received', 'Spent'],
        datasets: [{
            data: [75, 25],
            backgroundColor: ['#007bff', '#ff6384'],
        }]
    },
    options: {
        legend: {
            display: false
        }
    }
});


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