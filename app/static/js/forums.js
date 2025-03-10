document.addEventListener("DOMContentLoaded", function () {
    loadThreads();
    const questionForm = document.getElementById("question-form");
    if (questionForm) {
        questionForm.addEventListener("submit", submitQuestion);
    }
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
                threadItem.innerHTML = `
                    <div class="thread-header">
                        <span class="thread-title">${thread.title}</span>
                        <span class="thread-timestamp">${thread.timestamp}</span>
                    </div>
                    <p>${thread.content}</p>
                    <button onclick="loadReplies(${thread.tid})">View Replies</button>
                    <div class="reply-section" id="replies-${thread.tid}"></div>
                `;
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
                replyItem.textContent = `${reply.timestamp}: ${reply.content}`;
                replySection.appendChild(replyItem);
            });

            const replyForm = document.createElement("form");
            replyForm.innerHTML = `
                <textarea id="reply-content-${threadId}" placeholder="Add a reply..."></textarea>
                <button type="submit">Reply</button>
            `;
            replyForm.addEventListener("submit", (event) => submitReply(event, threadId));
            replySection.appendChild(replyForm);
        })
        .catch(error => console.error("Error loading replies:", error));
}

function submitReply(event, threadId) {
    event.preventDefault();
    const contentField = document.getElementById(`reply-content-${threadId}`);
    const content = contentField.value.trim();

    if (!content) {
        alert("Reply cannot be empty!");
        return;
    }

    fetch("/user/forums/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, content })
    })
        .then(response => response.json())
        .then(() => {
            contentField.value = ""; // Clear textarea after posting
            loadReplies(threadId);
        })
        .catch(error => console.error("Error submitting reply:", error));
}
