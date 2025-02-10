// script.js

// FAQ Toggle Functionality
document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;

        // Close all other answers
        document.querySelectorAll('.faq-answer').forEach((otherAnswer) => {
            if (otherAnswer !== answer && otherAnswer.style.display === 'block') {
                otherAnswer.style.display = 'none';
            }
        });

        // Toggle the clicked answer
        if (answer.style.display === 'block') {
            answer.style.display = 'none'; // Hide the answer
        } else {
            answer.style.display = 'block'; // Show the answer
        }
    });
});

// Submit Question Form (Forums Page)
document.getElementById('question-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('question-title')?.value;
    const body = document.getElementById('question-body')?.value;

    // Simulate adding the question to the thread list
    const threadList = document.getElementById('thread-list');
    const newThread = document.createElement('li');
    newThread.classList.add('thread-item');

    newThread.innerHTML = `
        <div class="thread-header">
            <span class="thread-title">${title}</span>
            <span class="thread-author">by Anonymous</span>
        </div>
        <div class="thread-body">
            <p>${body}</p>
        </div>
        <div class="replies"></div>
        <div class="thread-stats">
            <span class="replies">Replies: 0</span>
            <span class="views">Views: 0</span>
        </div>
        <button class="reply-button">Reply</button>
        <form class="reply-form" style="display: none;">
            <label for="reply-text">Your Reply:</label>
            <textarea id="reply-text" placeholder="Type your reply here..." required></textarea>
            <button type="submit">Submit Reply</button>
        </form>
    `;

    threadList.prepend(newThread);

    // Clear the form
    document.getElementById('question-form').reset();

    // Add event listeners to the new thread
    addReplyFunctionality(newThread);
});

// Add Reply Functionality to Existing Threads
document.querySelectorAll('.thread-item').forEach((thread) => {
    addReplyFunctionality(thread);
});

// Function to Add Reply Functionality
function addReplyFunctionality(thread) {
    const replyButton = thread.querySelector('.reply-button');
    const replyForm = thread.querySelector('.reply-form');

    // Toggle Reply Form Visibility
    replyButton.addEventListener('click', () => {
        if (replyForm.style.display === 'none' || replyForm.style.display === '') {
            replyForm.style.display = 'flex'; // Show the form
        } else {
            replyForm.style.display = 'none'; // Hide the form
        }
    });

    // Handle Reply Submission
    replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const replyText = replyForm.querySelector('textarea').value;

        // Create a new reply element
        const newReply = document.createElement('div');
        newReply.classList.add('reply');
        newReply.innerHTML = `<p><strong>You:</strong> ${replyText}</p>`;

        // Append the new reply to the replies section
        const repliesSection = thread.querySelector('.replies');
        repliesSection.appendChild(newReply);

        // Clear the form
        replyForm.querySelector('textarea').value = '';
        replyForm.style.display = 'none'; // Hide the form after submission

        // Update the reply count
        const replyCount = thread.querySelector('.replies');
        const currentCount = parseInt(replyCount.textContent.split(':')[1].trim());
        replyCount.textContent = `Replies: ${currentCount + 1}`;
    });
}

// Feedback Form Submission
document.getElementById('feedback-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('feedback-name')?.value;
    const email = document.getElementById('feedback-email')?.value;
    const message = document.getElementById('feedback-message')?.value;

    // Simulate sending feedback (you can replace this with an API call)
    console.log(`Feedback Received:
    Name: ${name}
    Email: ${email}
    Message: ${message}`);

    // Clear the form
    document.getElementById('feedback-form').reset();

    alert('Thank you for your feedback!');
});