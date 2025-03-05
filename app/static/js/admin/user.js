document.addEventListener("DOMContentLoaded", () => {
    const userList = document.getElementById("user-list");
    const addUserBtn = document.getElementById("add-user-btn");
    const modal = document.getElementById("user-modal");
    const closeModal = document.querySelector(".close");
    const userForm = document.getElementById("user-form");
    const modalTitle = document.getElementById("modal-title");

    let editingUserId = null;

    // Fetch and Render Users
    async function fetchAndRenderUsers() {
        try {
            const response = await fetch("/admin/get_all_users");
            if (!response.ok) throw new Error("Failed to fetch users");
            const users = await response.json();

            userList.innerHTML = "";
            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.uid}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.location || "N/A"}</td>
                    <td>${user.mobile || "N/A"}</td>
                    <td>${user.role}</td>
                    <td>${user.associated_camp_id}</td>
                    <td>
                        <button class="edit-btn" data-id="${user.uid}">Edit</button>
                        <button class="delete-btn" data-id="${user.uid}">Delete</button>
                    </td>
                `;
                userList.appendChild(row);
            });

            // Add Event Listeners for Edit/Delete
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    openModalForEdit(userId);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    deleteUser(userId);
                });
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // Open Modal for Adding or Editing
    async function openModalForEdit(userId = null) {
        if (userId) {
            try {
                const response = await fetch(`/admin/get_user/${userId}`);
                if (!response.ok) throw new Error("Failed to fetch user details");
                const user = await response.json();

                modalTitle.textContent = "Edit User";
                document.getElementById("user-id").value = user.uid;
                document.getElementById("usernam    e").value = user.username;
                document.getElementById("email").value = user.email;
                document.getElementById("location").value = user.location || "";
                document.getElementById("mobile").value = user.mobile || "";
                document.getElementById("role").value = user.role;

                editingUserId = userId;
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        } else {
            modalTitle.textContent = "Add New User";
            userForm.reset();
            editingUserId = null;
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

    // Save User (Add or Update)
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userData = {
            uid: document.getElementById("user-id").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            location: document.getElementById("location").value,
            mobile: document.getElementById("mobile").value,
            role: document.getElementById("role").value,
        };

        try {
            let response;
            if (editingUserId) {
                // Update existing user
                response = await fetch(`/api/users/${editingUserId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });
            } else {
                // Add new user
                response = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });
            }

            if (!response.ok) throw new Error("Failed to save user");
            modal.style.display = "none";
            fetchAndRenderUsers();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    });

    // Delete User
    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`/admin/delete_user/${userId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete user");
            fetchAndRenderUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    // Filter Users
    document.getElementById("name-filter").addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        filterUsers(value, "username");
    });

    document.getElementById("location-filter").addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        filterUsers(value, "location");
    });


    document.getElementById("clear-filters").addEventListener("click", () => {
        document.getElementById("name-filter").value = "";
        document.getElementById("location-filter").value = "";
        document.getElementById("role-filter").value = "";
        fetchAndRenderUsers();
    });

    // Helper Function to Filter Users
    async function filterUsers(filterValue, field) {
        try {
            const response = await fetch(`/api/users?filter=${encodeURIComponent(filterValue)}&field=${field}`);
            if (!response.ok) throw new Error("Failed to fetch filtered users");
            const users = await response.json();

            renderFilteredUsers(users);
        } catch (error) {
            console.error("Error filtering users:", error);
        }
    }

    // Render Filtered Users
    function renderFilteredUsers(users) {
        userList.innerHTML = "";
        users.forEach((user) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.uid}</td>
                <td>${user.username}</td>
                <td>${user.location || "N/A"}</td>
                <td>${user.mobile || "N/A"}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-btn" data-id="${user.uid}">Edit</button>
                    <button class="delete-btn" data-id="${user.uid}">Delete</button>
                </td>
            `;
            userList.appendChild(row);

            // Add Event Listeners for Edit/Delete
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    openModalForEdit(userId);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    deleteUser(userId);
                });
            });
        });
    }

    // Initial Render
    fetchAndRenderUsers();

    // Add User Button
    addUserBtn.addEventListener("click", () => {
        openModalForEdit();
    });
});