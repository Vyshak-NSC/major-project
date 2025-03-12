document.addEventListener("DOMContentLoaded", function () {
    loadThreads();
});

function loadThreads() {
    fetch("/user/forums/threads")
        .then(response => response.json())
        .then(data => {
            const threadList = document.getElementById("thread-list");
            threadList.innerHTML = ""; // Clear the list

            if(data.length === 0) {
                threadList.innerHTML = "<p>No threads found.</p>";
                return;
            }
            data.forEach(thread => {
                const threadItem = createThreadElement(thread);
                threadList.appendChild(threadItem);
            });
        })
        .catch(error => console.error("Error loading threads:", error));
}

// 🔹 Create a thread element (Modular function)
function createThreadElement(thread) {
    const threadItem = document.createElement("li");
    threadItem.className = "thread-item";

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
                ? `<button class="toggle-replies-btn" data-thread-id="${thread.tid}">
                    Replies: ${thread.reply_count}
                </button>` 
                : ""
            }
        </div>

        <div class="replies" id="replies-${thread.tid}" style="display: none;">
            ${thread.replies.map(reply => `<p><strong>${reply.username}:</strong> ${reply.content}</p>`).join("")}
        </div>

        <button class="reply-button">Reply</button>
        
        <form style="display: none;" method="post" class="reply-form">
            <label for="reply-content">Reply:</label>
            <input type="text" class="reply-content" name="content" required>
            <button type="submit">Submit</button>
            <input type="hidden" name="thread_id" value="${thread.tid}">
        </form>
    `;

    attachEventListeners(threadItem, thread.tid);
    return threadItem;
}

// 🔹 Attach event listeners to thread (Encapsulation)
function attachEventListeners(threadItem, threadId) {
    const replyButton = threadItem.querySelector(".reply-button");
    const replyForm = threadItem.querySelector(".reply-form");
    const toggleRepliesBtn = threadItem.querySelector(".toggle-replies-btn");
    const repliesDiv = threadItem.querySelector(".replies");

    // Show reply form on button click
    replyButton.addEventListener("click", function () {
        replyButton.style.display = "none";
        replyForm.style.display = "block";
    });

    // Handle reply form submission
    replyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitReply(replyForm, threadId);
    });

    // Toggle replies display
    if (toggleRepliesBtn) {
        toggleRepliesBtn.addEventListener("click", function () {
            repliesDiv.style.display = "block"; 
            toggleRepliesBtn.style.display = "none";
        });
    }
}

// 🔹 Submit reply (Separate function)
function submitReply(replyForm, threadId) {
    fetch('/user/forums/reply', {
        method: 'POST',
        body: new FormData(replyForm),
        headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.error("Error adding reply:", result.error);
        } else {
            loadThreads(); // Reload threads
            setTimeout(() => toggleReplies(threadId), 500); // Ensure new replies are visible
        }
    })
    .catch(error => console.error("Error submitting reply:", error));
}

// 🔹 Toggle replies (Reusable function)
function toggleReplies(threadId) {
    const toggleBtn = document.querySelector(`.toggle-replies-btn[data-thread-id="${threadId}"]`);
    if (toggleBtn) {
        toggleBtn.click(); // Click the button to show replies
    }
}




function submitFeedback(feedbackForm) {
    fetch("/user/submit_feedback", {
        method: "POST",
        body: new FormData(feedbackForm),
        headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
            feedbackForm.reset(); // Clear the form after submission
    })
    .catch(error => {
        console.error("Error submitting feedback:", error);
    });
}


function submitQuestion(){
    const questionForm = document.getElementById("question-form");
    fetch('/user/forums/add_thread', {
        method: 'POST',
        body: new FormData(questionForm),
        headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(result => {
        if(result.error){
            console.error("Error adding question:", result.error);
        }else{
            loadThreads();
        }
    })
}

document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.getElementById("feedback-form");
    const questionForm = document.getElementById("question-form");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (event) {
            event.preventDefault();
            submitFeedback(feedbackForm);
        });
    }

    if(questionForm){
        questionForm.addEventListener("submit", function(event){
            event.preventDefault();
            submitQuestion();
        });
    }
});