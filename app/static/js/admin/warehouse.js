// Sample JavaScript for Warehouse Management

// Mock Data for Warehouses
const warehouses = [
    {
        id: "WH001",
        place: "Mumbai",
        district: "Mumbai City",
        state: "Maharashtra",
        coordinates: "19.0760, 72.8777",
        head: "John Doe",
        phone: "9876543210"
    },
    {
        id: "WH002",
        place: "Delhi",
        district: "New Delhi",
        state: "Delhi",
        coordinates: "28.7041, 77.1025",
        head: "Jane Smith",
        phone: "9876543211"
    },
    {
        id: "WH003",
        place: "Bangalore",
        district: "Bangalore Urban",
        state: "Karnataka",
        coordinates: "12.9716, 77.5946",
        head: "Alice Johnson",
        phone: "9876543212"
    },
    {
        id: "WH004",
        place: "Hyderabad",
        district: "Ranga Reddy",
        state: "Telangana",
        coordinates: "17.3850, 78.4867",
        head: "Bob Brown",
        phone: "9876543213"
    },
    {
        id: "WH005",
        place: "Chennai",
        district: "Chennai",
        state: "Tamil Nadu",
        coordinates: "13.0827, 80.2707",
        head: "Emily Davis",
        phone: "9876543214"
    }
];

// DOM Elements
const warehouseTableBody = document.getElementById("warehouse-table-body");
const addWarehouseBtn = document.getElementById("add-warehouse-btn");
const warehouseModal = document.getElementById("warehouse-modal");
const closeModalBtn = document.querySelector(".close");
const warehouseForm = document.getElementById("warehouse-form");

// Populate Table
function populateTable() {
    warehouseTableBody.innerHTML = ""; // Clear existing rows
    warehouses.forEach((warehouse, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${warehouse.id}</td>
            <td>${warehouse.place}</td>
            <td>${warehouse.district}</td>
            <td>${warehouse.state}</td>
            <td>${warehouse.coordinates}</td>
            <td>${warehouse.head}</td>
            <td>${warehouse.phone}</td>
            <td>
                <button class="edit-btn" onclick="editWarehouse(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteWarehouse(${index})">Delete</button>
            </td>
        `;
        warehouseTableBody.appendChild(row);
    });
}

// Add Warehouse
addWarehouseBtn.addEventListener("click", () => {
    document.getElementById("modal-title").textContent = "Add New Warehouse";
    warehouseModal.style.display = "flex";
});

// Close Modal
closeModalBtn.addEventListener("click", () => {
    warehouseModal.style.display = "none";
});

// Handle Form Submission
warehouseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const warehouse = {
        id: document.getElementById("warehouse-id").value,
        place: document.getElementById("place").value,
        district: document.getElementById("district").value,
        state: document.getElementById("state").value,
        coordinates: document.getElementById("coordinates").value,
        head: document.getElementById("warehouse-head").value,
        phone: document.getElementById("phone").value,
    };

    // Check if we are editing or adding a new warehouse
    const modalTitle = document.getElementById("modal-title").textContent;
    if (modalTitle === "Add New Warehouse") {
        warehouses.push(warehouse); // Add new warehouse
    } else {
        const index = parseInt(document.getElementById("warehouse-index").value);
        warehouses[index] = warehouse; // Update existing warehouse
    }

    populateTable(); // Re-render table
    warehouseModal.style.display = "none"; // Hide modal
    warehouseForm.reset(); // Reset form
    document.getElementById("warehouse-index").value = ""; // Clear hidden index field
});

// Delete Warehouse
function deleteWarehouse(index) {
    warehouses.splice(index, 1); // Remove warehouse from array
    populateTable(); // Re-render table
}

// Edit Warehouse
function editWarehouse(index) {
    const warehouse = warehouses[index];
    document.getElementById("modal-title").textContent = "Edit Warehouse";
    document.getElementById("warehouse-id").value = warehouse.id;
    document.getElementById("place").value = warehouse.place;
    document.getElementById("district").value = warehouse.district;
    document.getElementById("state").value = warehouse.state;
    document.getElementById("coordinates").value = warehouse.coordinates;
    document.getElementById("warehouse-head").value = warehouse.head;
    document.getElementById("phone").value = warehouse.phone;
    document.getElementById("warehouse-index").value = index; // Store index in hidden field
    warehouseModal.style.display = "flex"; // Show modal
}

// Initialize Table
populateTable();

// Search Functionality
document.getElementById("warehouse-id-filter").addEventListener("input", (e) => {
    const filterValue = e.target.value.toLowerCase();
    const filteredWarehouses = warehouses.filter((warehouse) =>
        warehouse.id.toLowerCase().includes(filterValue)
    );
    renderFilteredTable(filteredWarehouses);
});

// Render Filtered Table
function renderFilteredTable(filteredWarehouses) {
    warehouseTableBody.innerHTML = "";
    filteredWarehouses.forEach((warehouse, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${warehouse.id}</td>
            <td>${warehouse.place}</td>
            <td>${warehouse.district}</td>
            <td>${warehouse.state}</td>
            <td>${warehouse.coordinates}</td>
            <td>${warehouse.head}</td>
            <td>${warehouse.phone}</td>
            <td>
                <button class="edit-btn" onclick="editWarehouse(${warehouses.indexOf(warehouse)})">Edit</button>
                <button class="delete-btn" onclick="deleteWarehouse(${warehouses.indexOf(warehouse)})">Delete</button>
            </td>
        `;
        warehouseTableBody.appendChild(row);
    });
}

// Clear Search
document.getElementById("clear-search").addEventListener("click", () => {
    document.getElementById("warehouse-id-filter").value = "";
    populateTable();
});