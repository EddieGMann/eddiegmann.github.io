 // Fetch the nav.html and insert it into the 'navbar' div
fetch('navigationpane.html')
	.then(response => response.text())
	.then(data => {
                document.getElementById('navbar').innerHTML = data;
 });


document.getElementById('highlightexp').addEventListener('click', function (event) {
    const highlightSection = document.getElementById('highlightSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = highlightSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        highlightSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        highlightSection.classList.remove('dimmed');
        highlightSection.classList.add('highlight');

        // Scroll to the highlighted section
        highlightSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const highlightSection = document.getElementById('highlightSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    highlightSection.classList.remove('highlight');
});
















