document.addEventListener("DOMContentLoaded", () => {
    const campTableBody = document.getElementById("camp-table-body");
    const addCampBtn = document.getElementById("add-camp-btn");
    const modal = document.getElementById("camp-modal");
    const closeModal = document.querySelector(".close");
    const campForm = document.getElementById("camp-form");
    const modalTitle = document.getElementById("modal-title");

    let editingCampId = null;

    // Fetch and Render Camps
    async function fetchAndRenderCamps(filter = "") {
        try {
            const response = await fetch('/admin/get_all_camps');
            if (!response.ok) throw new Error("Failed to fetch camps");
            const camps = await response.json();

            campTableBody.innerHTML = "";
            camps.forEach((camp) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${camp.cid}</td>
                    <td>${camp.camp_name}</td>
                    <td>${camp.location}</td>
                    <td>${camp.coordinates.lat}, ${camp.coordinates.lng}</td>
                    <td>${camp.contact_number || "N/A"}</td>
                    <td>${camp.status}</td>
                    <td>
                        <button class="edit-btn" data-id="${camp.cid}">Edit</button>
                        <button class="delete-btn" data-id="${camp.cid}">Delete</button>
                    </td>
                `;
                campTableBody.appendChild(row);
            });

            // Add Event Listeners for Edit/Delete
            attachEditListeners();
            attachDeleteListeners();
        } catch (error) {
            console.error("Error fetching camps:", error);
        }
    }

    // Attach Event Listeners for Edit Buttons
    function attachEditListeners() {
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const campId = e.target.dataset.id;
                openModalForEdit(campId);
            });
        });
    }

    // Attach Event Listeners for Delete Buttons
    function attachDeleteListeners() {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                const campId = e.target.dataset.id;
                deleteCamp(campId);
            });
        });
    }

    // Open Modal for Adding a New Camp
    function openModalForCreate() {
        modalTitle.textContent = "Add New Camp";
        campForm.reset();
        editingCampId = null;
        modal.style.display = "flex";
    }

    // Open Modal for Editing an Existing Camp
    async function openModalForEdit(campId) {
        try {
            const response = await fetch(`/admin/get_camp_data/${campId}`);
            if (!response.ok) throw new Error("Failed to fetch camp details");
            const camp = await response.json();

            modalTitle.textContent = "Edit Camp";
            document.getElementById("camp-name").value = camp.camp_name;
            document.getElementById("camp-capacity").value = camp.capacity;
            document.getElementById("location").value = camp.location;
            document.getElementById("coordinates").value = `${camp.coordinates.lat}, ${camp.coordinates.lng}`;
            document.getElementById("phone").value = camp.contact_number || "";

            editingCampId = camp.cid;
            modal.style.display = "flex";
        } catch (error) {
            console.error("Error fetching camp details:", error);
        }
    }

    // Close Modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Handle Form Submission (Create or Edit)
    campForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            camp_name: document.getElementById("camp-name").value,
            camp_capacity: parseInt(document.getElementById("camp-capacity").value),
            location: document.getElementById("location").value,
            coordinates: document.getElementById("coordinates").value.split(",").map(coord => parseFloat(coord.trim())),
            contact_number: document.getElementById("phone").value,
        };

        try {
            if (editingCampId) {
                await updateCamp(editingCampId, formData);
            } else {
                await createCamp(formData);
            }
            modal.style.display = "none";
            fetchAndRenderCamps();
        } catch (error) {
            console.error("Error saving camp:", error);
        }
    });

    // Create a New Camp
    async function createCamp(formData) {
        try {
            const response = await fetch("/admin/create_camp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to create camp");
        } catch (error) {
            console.error("Error creating camp:", error);
            throw error;
        }
    }

    // Update an Existing Camp
    async function updateCamp(campId, formData) {
        try {
            const response = await fetch(`/admin/update_camp_data/${campId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to update camp");
        } catch (error) {
            console.error("Error updating camp:", error);
            throw error;
        }
    }

    // Delete a Camp
    async function deleteCamp(campId) {
        if (!confirm("Are you sure you want to delete this camp?")) return;

        try {
            const response = await fetch(`/admin/delete-camp/${campId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete camp");
            fetchAndRenderCamps();
        } catch (error) {
            console.error("Error deleting camp:", error);
        }
    }

    // Filter Camps
    document.getElementById("camp-id-filter").addEventListener("input", (e) => {
        const filter = e.target.value.toLowerCase();
        fetchAndRenderCamps(filter);
    });

    document.getElementById("clear-search").addEventListener("click", () => {
        document.getElementById("camp-id-filter").value = "";
        fetchAndRenderCamps();
    });

    // Initial Render
    fetchAndRenderCamps();

    // Add Camp Button
    addCampBtn.addEventListener("click", () => {
        openModalForCreate();
    });
});