document.addEventListener("DOMContentLoaded", () => {
    const userList = document.getElementById("user-list");

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
                    <td>${user.mobile || "N/A"}</td>
                    <td>${user.role}</td>
                    <td>
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

    // Load users when the page loads
    fetchAndRenderUsers();
});

