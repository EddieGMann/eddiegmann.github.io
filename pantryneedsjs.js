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

// === Google Sheets Fetch ===
// Replace with your actual spreadsheet ID and API key
const sheetID = "YOUR_SHEET_ID";
const apiKey = "YOUR_API_KEY";
const sheetName = "Needs"; // The tab name in your Google Sheet

const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}!A:D?key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    const values = data.values;
    const tableBody = document.querySelector("#needsList tbody");

    if (!values || values.length < 2) {
      tableBody.innerHTML = "<tr><td colspan='4'>No data found</td></tr>";
      return;
    }

    // Remove header row from the data
    const rows = values.slice(1);

    // Fill table
    tableBody.innerHTML = "";
    rows.forEach(row => {
      const [item, current, minimum, needed] = row;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item || ""}</td>
        <td>${current || ""}</td>
        <td>${minimum || ""}</td>
        <td>${needed || ""}</td>
      `;

      tableBody.appendChild(tr);
    });
  })
  .catch(err => {
    console.error("Error fetching Needs sheet:", err);
    document.querySelector("#needsList tbody").innerHTML = 
      "<tr><td colspan='4'>Error loading data</td></tr>";
  });
