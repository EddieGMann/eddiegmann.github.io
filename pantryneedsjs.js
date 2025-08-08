const endpoint = 'https://script.google.com/macros/s/AKfycbws4LpdjlOFQNT1ktpfc0LrVRT4nNCSG3Bp5ZzVyD1SC-s6Ucz13GOV91FPzrVmS_1Z/exec';
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

function printNeedsList() {
  const tableBody = document.querySelector("#needsList tbody");
  let rows = tableBody.querySelectorAll("tr");

  // Create a new printable window
  let printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write("<html><head><title>Needs List</title></head><body>");
  printWindow.document.write("<h2>Needs List</h2>");
  printWindow.document.write("<table border='1' style='border-collapse: collapse; width: 100%;'>");
  printWindow.document.write("<tr><th>Item</th><th>Needed</th></tr>");

  rows.forEach(row => {
    let cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      let item = cells[0].innerText;
      let needed = cells[1].innerText;
      printWindow.document.write(`<tr><td>${item}</td><td>${needed}</td></tr>`);
    }
  });

  printWindow.document.write("</table>");
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
}


// Initial load
loadNeedsData();

// Refresh data every 3 seconds (3000 milliseconds)
setInterval(loadNeedsData, 3000);
