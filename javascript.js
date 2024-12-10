 // Fetch the nav.html and insert it into the 'navbar' div
fetch('navigationpane.html')
	.then(response => response.text())
	.then(data => {
                document.getElementById('navbar').innerHTML = data;
 });


document.getElementById('highlightexp').addEventListener('click', function (event) {
    const HLSection = document.getElementById('expSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('expSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});


document.getElementById('highlightedu').addEventListener('click', function (event) {
    const HLSection = document.getElementById('eduSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('eduSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});


document.getElementById('highlightprj').addEventListener('click', function (event) {
    const HLSection = document.getElementById('prjSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('prjSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});


document.getElementById('highlightexpoe').addEventListener('click', function (event) {
    const HLSection = document.getElementById('addwexpSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('addwexpSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});

document.getElementById('highlightskl').addEventListener('click', function (event) {
    const HLSection = document.getElementById('sklsSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('sklsSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});


document.getElementById('highlightawd').addEventListener('click', function (event) {
    const HLSection = document.getElementById('awdsSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Check if the highlight class is already applied
    const isHighlighted = HLSection.classList.contains('highlight');

    if (isHighlighted) {
        // If already highlighted, remove all effects
        allSections.forEach(section => {
            section.classList.remove('dimmed');
        });
        HLSection.classList.remove('highlight');
    } else {
        // Otherwise, apply the effects
        allSections.forEach(section => {
            section.classList.add('dimmed');
        });
        HLSection.classList.remove('dimmed');
        HLSection.classList.add('highlight');

        // Scroll to the highlighted section
        HLSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Stop event propagation to prevent immediate toggle-off
    event.stopPropagation();
});

// Add a click listener to the document to toggle off highlighting
document.addEventListener('click', function () {
    const HLSection = document.getElementById('awdsSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Remove all effects
    allSections.forEach(section => {
        section.classList.remove('dimmed');
    });
    HLSection.classList.remove('highlight');
});

// Select all buttons with the class 'return-to-top'
const buttons = document.querySelectorAll('.return-to-top');

// Add event listener to each button
buttons.forEach(button => {
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    });
});

document.getElementById('dukestyle').addEventListener('click', function () {
    const stylesheet = document.getElementById('stylesheet');

    // Toggle between stylesheets
    if (stylesheet.getAttribute('href') !== 'duke.css') {
        stylesheet.setAttribute('href', 'duke.css');
    } else {
        stylesheet.setAttribute('href', 'styles.css');
    }
});

document.getElementById('halloween').addEventListener('click', function () {
    const stylesheet = document.getElementById('stylesheet');

    // Toggle between stylesheets
    if (stylesheet.getAttribute('href') !== 'halloween.css') {
        stylesheet.setAttribute('href', 'halloween.css');
    } else {
        stylesheet.setAttribute('href', 'styles.css');
    }
});








