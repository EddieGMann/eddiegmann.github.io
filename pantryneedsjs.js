const endpoint = 'https://script.google.com/macros/s/AKfycbzeAOCFW1ICEIhFsgf5BXKeh9nGu1rEJOLQW2hxbdTgXn2KyYMN9hT42dW67OxcEJWK/exec';
const sheetName = "Needs";

function toggleDropdown() {
  document.getElementById("categoryDropdown").classList.toggle("show");
}

window.addEventListener("click", function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      openDropdown.classList.remove("show");
    }
  }
});


async function loadNeedsData() {
  try {
    const res = await fetch(`${endpoint}?sheet=${encodeURIComponent(sheetName)}`);
    const data = await res.json();

    const tableBody = document.querySelector("#needsList tbody");

    if (!Array.isArray(data) || data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No data found</td></tr>";
      return;
    }

    tableBody.innerHTML = "";
    data.forEach(row => {
  const item = row.item ?? "";
  // Replace empty or falsy values with 0 for these numeric columns
  const current = (row.current === undefined || row.current === null || row.current === "") ? 0 : row.current;
  const minimum = (row.minimum === undefined || row.minimum === null || row.minimum === "") ? 0 : row.minimum;
  const needed = (row.needed === undefined || row.needed === null || row.needed === "") ? 0 : row.needed;
      const styledNeeded = `<span style="font-weight: bold; color: #F74902; padding: 2px 6px; border-radius: 4px;">${needed}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item}</td>
        <td>${styledNeeded}</td>
        <td>${current}</td>
        <td>${minimum}</td>        
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching Needs sheet:", err);
    document.querySelector("#needsList tbody").innerHTML = "<tr><td colspan='4'>Error loading data</td></tr>";
  }
}

// Initial load
loadNeedsData();

// Refresh data every 3 seconds (3000 milliseconds)
setInterval(loadNeedsData, 3000);
