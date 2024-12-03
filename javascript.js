 // Fetch the nav.html and insert it into the 'navbar' div
fetch('navigationpane.html')
	.then(response => response.text())
	.then(data => {
                document.getElementById('navbar').innerHTML = data;
 });


document.getElementById('highlightexp').addEventListener('click', function () {
    const highlightSection = document.getElementById('highlightSection');
    const allSections = document.querySelectorAll('.highlighteddiv');

    // Dim all sections
    allSections.forEach(section => {
        section.classList.add('dimmed');
    });

    // Highlight the target section
    highlightSection.classList.remove('dimmed');
    highlightSection.classList.add('highlight');
});













