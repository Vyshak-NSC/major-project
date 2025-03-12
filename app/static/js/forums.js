document.addEventListener("DOMContentLoaded", function () {
    loadThreads();
});
function loadThreads() {
    fetch("/user/forums/threads")
        .then(response => response.json())
        .then(data => {
            const threadList = document.getElementById("thread-list");
            threadList.innerHTML = ""; // Clear the list

            data.forEach(thread => {
                const threadItem = document.createElement("li");
                threadItem.className = "thread-item";

                // Get pre-rendered reply form from the data attribute
                const replyFormHTML = threadList.dataset.replyform; 

                threadItem.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${thread.title}</span>
                        <span class="thread-timestamp">${thread.timestamp}</span>
                    </div>
                    <div class="thread-body">
                        <p>${thread.content}</p>
                    </div>

                    <div class="thread-stats">
                    ${thread.reply_count > 0 
                        ? `<button class="toggle-replies" data-thread-id="${thread.tid}">
                            Replies: ${thread.reply_count}
                        </button>` 
                        : ""
                    }
                </div>

                    <div class="replies" id="replies-${thread.tid}" style="display: none;">
                        <span>
                        ${thread.replies.map(reply => `<p><strong>${reply.username}:</strong> ${reply.content}</p>`).join("")}
                        </span>
                    </div>

                    <!-- Reply Button -->
                    <button class="reply-button">Reply</button>
                    
                    <!-- Reply Form (Initially Hidden) -->
                    <form style="display: none;" method="post" class="reply-form">
                        <label for="reply-content">Reply:</label>
                        <input type='text' id="reply-content" name="content" required>
                        <button type="submit-reply">Submit</button>
                        <input type="hidden" name="thread_id" value="${thread.tid}">
                    </form>
                `;

                
                console.log(thread.replies);
                // Attach event listener to the reply button
                const replyButton = threadItem.querySelector(".reply-button");
                const replyForm = threadItem.querySelector(".reply-form");
                
                replyButton.addEventListener("click", function () {
                    replyButton.style.display = "none"; // Hide the button
                    replyForm.style.display = "block"; // Show the form
                });

                // Attach event listener to the reply form
                replyForm.addEventListener("submit", function (event) {
                    event.preventDefault();
                    fetch('/user/forums/reply', {
                        method: 'POST',
                        body: new FormData(replyForm),
                        headers: {
                            "Accept": "application/json"
                        }
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.error) {
                        } else {
                            loadThreads(); // Reload threads to show new reply
                        }
                    })
                });

                const listreplies = threadItem.querySelector(".toggle-replies");
                const replies = threadItem.querySelector(".replies");

                // Only add event listener if the toggle button exists
                if (listreplies) {
                    listreplies.addEventListener("click", function () {
                        replies.style.display = 'block';
                        listreplies.style.display = 'none';
                    });
                }
                

                

                threadList.appendChild(threadItem);
            });
        })
        .catch(error => console.error("Error loading threads:", error));
}


function loadReplies(threadId) {
    fetch(`/user/forums/replies/${threadId}`)
        .then(response => response.json())
        .then(data => {
            const replySection = document.getElementById(`replies-${threadId}`);
            replySection.innerHTML = ""; // Clear previous replies

            data.forEach(reply => {
                const replyItem = document.createElement("p");
                replyItem.innerHTML = `<strong>${reply.user}:</strong> ${reply.content}`;
                replySection.appendChild(replyItem);
            });

            // Append reply form
            const replyForm = document.createElement("form");
            replyForm.className = "reply-form";
            replyForm.innerHTML = `
                <textarea id="reply-content-${threadId}" placeholder="Add a reply..." required></textarea>
                <button type="submit">Reply</button>
            `;

            replyForm.addEventListener("submit", (event) => submitReply(event, threadId));
            replySection.appendChild(replyForm);
        })
        .catch(error => console.error("Error loading replies:", error));
}
