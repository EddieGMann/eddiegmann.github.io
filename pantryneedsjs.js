const endpoint = 'https://script.google.com/macros/s/AKfycbzeAOCFW1ICEIhFsgf5BXKeh9nGu1rEJOLQW2hxbdTgXn2KyYMN9hT42dW67OxcEJWK/exec';
const sheetName = "Needs";

// === Dropdown Logic ===
function toggleDropdown() {
  document.getElementById("categoryDropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};



fetch(`${endpoint}?sheet=${encodeURIComponent(sheetName)}`)
  .then(res => res.json())
  .then(data => {
    const tableBody = document.querySelector("#needsList tbody");

    if (!Array.isArray(data) || data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No data found</td></tr>";
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(row => {
  const item = row.item ?? "";
      const needed = row.needed ?? "";
const styledNeeded = `<span style="font-weight: bold; background-color: #F74902; padding: 2px 6px; border-radius: 4px;">${needed}</span>`;
  const current = row.current ?? "";
  const minimum = row.minimum ?? "";
  

  const tr = document.createElement("tr");
  tr.innerHTML = `   
    <td>${item}</td>
    <td>${styledNeeded}</td>
    <td>${current}</td>
    <td>${minimum}</td>
    
  `;
  tableBody.appendChild(tr);
});

  })
  .catch(err => {
    console.error("Error fetching Needs sheet:", err);
    document.querySelector("#needsList tbody").innerHTML = "<tr><td colspan='4'>Error loading data</td></tr>";
  });

// Initial load
loadNeedsData();

// Refresh data every 15 seconds (15000 milliseconds)
setInterval(loadNeedsData, 3000);

