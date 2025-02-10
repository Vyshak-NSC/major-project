// Handle Form Submission
document.getElementById('volunteer-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const location = document.getElementById('location').value;
    const roleId = document.getElementById('role-id').value;

    // Display confirmation message
    alert(`Thank you, ${name}! Your application for Role ID ${roleId} has been submitted successfully.`);

    // Reset form
    document.getElementById('volunteer-form').reset();
});
// Typewriter Text Loop
const texts = ["Your contribution can save lives !.", "Be the change !."];
let textIndex = 0; // Tracks the current text
const typewriterElement = document.querySelector('.typewriter-text');

function typeWriter(text, element, callback) {
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i); // Add one character at a time
            i++;
        } else {
            clearInterval(interval); // Stop typing
            setTimeout(() => {
                eraseText(element, callback); // Call erasing function
            }, 2000); // Wait 2 seconds before erasing
        }
    }, 100); // Adjust typing speed (100ms per character)
}

function eraseText(element, callback) {
    let text = element.textContent;
    const interval = setInterval(() => {
        if (text.length > 0) {
            text = text.slice(0, -1); // Remove one character at a time
            element.textContent = text;
        } else {
            clearInterval(interval); // Stop erasing
            callback(); // Call the callback to type the next text
        }
    }, 50); // Adjust erasing speed (50ms per character)
}

function startTypewriter() {
    const currentText = texts[textIndex];
    typeWriter(currentText, typewriterElement, () => {
        textIndex = (textIndex + 1) % texts.length; // Cycle through texts
        startTypewriter(); // Loop back to the next text
    });
}

// Start the typewriter effect on page load
document.addEventListener('DOMContentLoaded', () => {
    startTypewriter();
});