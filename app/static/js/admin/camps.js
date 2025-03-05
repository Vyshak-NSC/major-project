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
                    <td>${camp.head}</td>
                    <td>${camp.contact_number}</td>
                    <td>${camp.status}</td>
                    <td>
                        <button class="edit-btn" data-id="${camp.id}">Edit</button>
                        <button class="delete-btn" data-id="${camp.id}">Delete</button>
                    </td>
                `;
                campTableBody.appendChild(row);
            });

            // Add Event Listeners for Edit/Delete
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const campId = e.target.dataset.id;
                    openModalForEdit(campId);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const campId = e.target.dataset.id;
                    deleteCamp(campId);
                });
            });
        } catch (error) {
            console.error("Error fetching camps:", error);
        }
    }

    // Open Modal for Adding or Editing
    async function openModalForEdit(campId = null) {
        if (campId) {
            try {
                const response = await fetch(`/api/camps/${campId}`);
                if (!response.ok) throw new Error("Failed to fetch camp details");
                const camp = await response.json();

                modalTitle.textContent = "Edit Camp";
                document.getElementById("camp-id").value = camp.id;
                document.getElementById("place").value = camp.place;
                document.getElementById("district").value = camp.district;
                document.getElementById("state").value = camp.state;
                document.getElementById("coordinates").value = camp.coordinates;
                document.getElementById("camp-head").value = camp.head;
                document.getElementById("phone").value = camp.phone;

                editingCampId = campId;
            } catch (error) {
                console.error("Error fetching camp details:", error);
            }
        } else {
            modalTitle.textContent = "Add New Camp";
            campForm.reset();
            editingCampId = null;
        }
        modal.style.display = "flex";
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

    // Save Camp (Add or Update)
    campForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const campData = {
            id: document.getElementById("camp-id").value,
            place: document.getElementById("place").value,
            district: document.getElementById("district").value,
            state: document.getElementById("state").value,
            coordinates: document.getElementById("coordinates").value,
            head: document.getElementById("camp-head").value,
            phone: document.getElementById("phone").value,
        };

        try {
            let response;
            if (editingCampId) {
                // Update existing camp
                response = await fetch(`/api/camps/${editingCampId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(campData),
                });
            } else {
                // Add new camp
                response = await fetch("/api/camps", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(campData),
                });
            }

            if (!response.ok) throw new Error("Failed to save camp");
            modal.style.display = "none";
            fetchAndRenderCamps();
        } catch (error) {
            console.error("Error saving camp:", error);
        }
    });

    // Delete Camp
    async function deleteCamp(campId) {
        if (!confirm("Are you sure you want to delete this camp?")) return;

        try {
            const response = await fetch(`/api/camps/${campId}`, { method: "DELETE" });
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
        openModalForEdit();
    });
});