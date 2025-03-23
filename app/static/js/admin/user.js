document.addEventListener("DOMContentLoaded", () => {
    const userList = document.getElementById("user-list");
    const userModal = document.getElementById("user-modal");
    const closeModalBtn = document.querySelector(".close-btn");
    const userForm = document.getElementById("user-form");
    const addUserBtn = document.getElementById("add-user-btn"); // Add User Button

    let editingUserId = null; // Store user ID when editing

    // Fetch and Render Users
    async function fetchAndRenderUsers() {
        try {
            const response = await fetch("/admin/get_all_users");
            if (!response.ok) throw new Error("Failed to fetch users");
            const users = await response.json();

            userList.innerHTML = ""; // Clear the list before updating
            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.uid}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.location || "N/A"}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="edit-btn" data-id="${user.uid}">Edit</button>
                        <button class="delete-btn" data-id="${user.uid}">Delete</button>
                    </td>
                `;
                userList.appendChild(row);
            });

            // Attach Delete Event Listeners
            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    deleteUser(userId);
                });
            });

            // Attach Edit Event Listeners
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (e) => {
                    const userId = e.target.dataset.id;
                    openEditModal(userId);
                });
            });

        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // Delete User Function
    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`/admin/delete_user/${userId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete user");

            fetchAndRenderUsers(); // Refresh list after deletion
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    // Open Modal for Editing User
    async function openEditModal(userId) {
        try {
            const response = await fetch(`/admin/get_user/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user data");

            const user = await response.json();

            // Fill the form with existing user data
            document.getElementById("username").value = user.username;
            document.getElementById("email").value = user.email;
            document.getElementById("location").value = user.location || "";
            // document.getElementById("mobile").value = user.mobile || "";
            document.getElementById("role").value = user.role;
            document.getElementById("associated-camp-id").value = user.associated_camp_id || "";

            editingUserId = userId; // Store ID for updating
            userModal.style.display = "block"; // Show modal
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }

    // Open Modal for Adding New User
    function openAddModal() {
        // Clear the form fields
        userForm.reset();
        editingUserId = null; // Ensure it's a new user
        userModal.style.display = "block"; // Show modal
    }

    // Handle Form Submission (Add or Edit User)
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userData = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            location: document.getElementById("location").value,
            // mobile: document.getElementById("mobile").value,
            role: document.getElementById("role").value,
            associated_camp_id: document.getElementById("associated-camp-id").value
        };

        try {
            let response;
            if (editingUserId) {
                // Update existing user
                response = await fetch(`/admin/update_user/${editingUserId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            } else {
                // Add new user
                response = await fetch("/admin/add_user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData)
                });
            }

            if (!response.ok) throw new Error("Failed to save user");

            userModal.style.display = "none"; // Hide modal
            fetchAndRenderUsers(); // Refresh list
        } catch (error) {
            console.error("Error saving user:", error);
        }
    });

    // Close Modal Button
    closeModalBtn.addEventListener("click", () => {
        userModal.style.display = "none";
    });

    // Open Add User Modal on Button Click
    addUserBtn.addEventListener("click", openAddModal);

    // Close Modal if clicked outside content
    window.addEventListener("click", (e) => {
        if (e.target === userModal) {
            userModal.style.display = "none";
        }
    });

    // Load users when the page loads
    fetchAndRenderUsers();
});
