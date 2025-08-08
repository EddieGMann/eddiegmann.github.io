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

const endpoint = 'https://script.google.com/macros/s/AKfycbzeAOCFW1ICEIhFsgf5BXKeh9nGu1rEJOLQW2hxbdTgXn2KyYMN9hT42dW67OxcEJWK/exec';
const sheetName = "Needs";

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
      // Assuming your backend returns objects with keys: item, current, minimum, needed
      const item = row.item || "";
      const current = row.current || "";
      const minimum = row.minimum || "";
      const needed = row.needed || "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item}</td>
        <td>${current}</td>
        <td>${minimum}</td>
        <td>${needed}</td>
      `;
      tableBody.appendChild(tr);
    });
  })
  .catch(err => {
    console.error("Error fetching Needs sheet:", err);
    document.querySelector("#needsList tbody").innerHTML = "<tr><td colspan='4'>Error loading data</td></tr>";
  });

