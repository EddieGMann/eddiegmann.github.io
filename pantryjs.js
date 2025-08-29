const endpoint = 'https://script.google.com/macros/s/AKfycbyyltTFmNtNJ5i4C69MMLFdgl7VMV_DK0eH3C4E-0eIisL7f67-5p7Y_vyX0VVZIJVE/exec';
let pantryItems = [];
let currentSheet = 'Pantry'; // Default tab

// Utility to sanitize item names for IDs
function safeId(item) {
  return item.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}

function toggleDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
  // Only select default if hash is empty
  if (!window.location.hash) {
    selectCategory('Pantry');
  } else {
    // If hash exists, use it
    const category = window.location.hash.substring(1);
    selectCategory(category);
  }
});

// Handle hash changes (e.g., user clicks dropdown links)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash) {
    const category = hash.substring(1);
    selectCategory(category);
  }
});



function selectCategory(category) {
  currentSheet = category;
  document.getElementById("categoryDropdown").style.display = "none";
  loadPantry(currentSheet);
}

document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("categoryDropdown");
  const button = document.querySelector(".dropbtn");
  if (!dropdown.contains(event.target) && !button.contains(event.target)) {
    dropdown.style.display = "none";
  }
});

function addClickEffect(button) {
  button.classList.add("click-effect");
  setTimeout(() => button.classList.remove("click-effect"), 150);
}

function formatDateToMonthDay(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const suffix = day >= 11 && day <= 13 ? 'th' :
                 day % 10 === 1 ? 'st' :
                 day % 10 === 2 ? 'nd' :
                 day % 10 === 3 ? 'rd' : 'th';
  return `${month} ${day}${suffix}`;
}

async function loadPantry(sheet = 'Pantry') {
  try {
    const res = await fetch(`${endpoint}?sheet=${encodeURIComponent(sheet)}`);
    document.getElementById('currentSheetLabel').textContent = currentSheet;
    pantryItems = await res.json();
    pantryItems.sort((a, b) => a.item.localeCompare(b.item));
    renderPantryList(pantryItems);
  } catch (error) {
    document.getElementById('pantryList').textContent = 'Failed to load pantry data.';
    console.error('Load error:', error);
  }
}

function renderPantryList(items) {
  const container = document.getElementById('pantryList');
  container.innerHTML = '';
  if (items.length === 0) {
    container.textContent = 'No items match your search.';
    return;
  }
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  container.style.gap = '20px';

  items.forEach(({ item, quantity, category, timestamp, minimum }) => {
    const id = safeId(item);
    const displayQuantity = quantity != null && !isNaN(quantity) ? quantity : 0;
    const displayMinimum = minimum != null && !isNaN(minimum) ? minimum : 0;

    const div = document.createElement('div');
    div.className = 'item';
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.borderRadius = '12px';

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="text-align: left; width: 160px; word-wrap: break-word;">
          <strong>${item}</strong><br />
          <em style="color: gray;">${category || ''}</em><br />
          Quantity: <span id="qty-${id}">${displayQuantity}</span><br />
          ${currentSheet === 'Fridge' && timestamp ? `<span style="font-size: 12px; color: #888;">Last Added: ${timestamp}</span>` : ''}
        </div>
        <div style="text-align: center;">
          <div style="display: flex; align-items: center;">
            <button onclick="adjustItem('${item.replace(/'/g, "\\'")}', 'add'); addClickEffect(this);"
              style="background-image: linear-gradient(#F74902, #F74910); margin-right: 10px; border-radius: 12px; color:black; width: 55px; height: 55px; font-size: 24px;">+</button>
            <button onclick="adjustItem('${item.replace(/'/g, "\\'")}', 'subtract'); addClickEffect(this);"
              style="background-color: black; color:#F74902; width: 55px; height: 55px; font-size: 32px; padding-bottom: 5px; border-radius: 12px;">-</button>
            <button onclick="openEditModal('${item.replace(/'/g, "\\'")}', ${displayQuantity}, '${category ? category.replace(/'/g, "\\'") : ''}', ${displayMinimum}); addClickEffect(this);"
              style="background-color:#F74902; color:white; border:none; border-radius:6px; padding:6px 12px; margin-left: 10px; cursor:pointer;">
              Edit
            </button>
          </div>
          <input type="number" id="input-${id}" placeholder="Amount" min="1" style="width: 75px; margin-top: 10px;" />
          <button onclick="deleteItem('${item.replace(/'/g, "\\'")}'); addClickEffect(this);" 
            style="background-color: red; color: white; border: none; width: 18px; height: 18px; font-size: 10px; margin-left: 4px; cursor: pointer;">✕</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

async function adjustItem(item, action) {
  const id = safeId(item);
  const input = document.getElementById(`input-${id}`);
  const amount = Number(input.value);
  const validAmount = amount > 0 ? amount : 1;

  const url = `${endpoint}?sheet=${encodeURIComponent(currentSheet)}&item=${encodeURIComponent(item)}&action=${action}&amount=${validAmount}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      loadPantry(currentSheet);
      input.value = '';
    } else {
      alert('Update failed: ' + data.error);
    }
  } catch (error) {
    alert('Failed to update item.');
    console.error(error);
  }
}

function addNewItem() {
  const title = document.getElementById('addItemModalTitle');
  title.textContent = `New ${currentSheet} Item`;

  document.getElementById('newItemName').value = '';
  document.getElementById('newItemQuantity').value = 0;
  document.getElementById('newItemMinimum').value = 0;
  document.getElementById('newItemCategory').value = '';

  document.getElementById('addItemModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('addItemModal').style.display = 'none';
}

async function submitNewItem() {
  const item = document.getElementById('newItemName').value.trim();
  const category = document.getElementById('newItemCategory').value.trim();
  const quantityInput = Number(document.getElementById('newItemQuantity').value);
  const minimumInput = Number(document.getElementById('newItemMinimum').value);

  const quantity = isNaN(quantityInput) || quantityInput < 0 ? 0 : quantityInput;
  const minimum = isNaN(minimumInput) || minimumInput < 0 ? 0 : minimumInput;

  if (!item) { alert("Item Name is required."); return; }

  try {
    const url = `${endpoint}?sheet=${encodeURIComponent(currentSheet)}&action=addNew&item=${encodeURIComponent(item)}&category=${encodeURIComponent(category)}&quantity=${quantity}&minimum=${minimum}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      // Reload the pantry from server instead of pushing manually
      await loadPantry(currentSheet);
      closeModal();
    } else {
      alert("Error adding item: " + data.error);
    }
  } catch (error) {
    alert("Error adding item.");
    console.error(error);
  }
}


// --------- Edit Modal ---------
function openEditModal(item, quantity, category, minimum) {
  const modal = document.getElementById('editItemModal');
  modal.style.display = 'block';

  document.getElementById('editItemName').value = item;
  document.getElementById('editItemQuantity').value = Number(quantity) || 0;
  document.getElementById('editItemCategory').value = category || '';
  document.getElementById('editItemMinimum').value = Number(minimum) || 0;

  modal.setAttribute('data-original-item', item);
}

function closeEditModal() {
  document.getElementById('editItemModal').style.display = 'none';
}

async function submitEditItem() {
  const modal = document.getElementById('editItemModal');
  const originalItem = modal.getAttribute('data-original-item');

  const newItem = document.getElementById('editItemName').value.trim();
  const newQuantity = Number(document.getElementById('editItemQuantity').value);
  const newCategory = document.getElementById('editItemCategory').value.trim();
  const newMinimum = Number(document.getElementById('editItemMinimum').value);

  if (!newItem) { alert('Item name cannot be empty.'); return; }
  if (isNaN(newQuantity) || newQuantity < 0) { alert('Quantity must be zero or positive.'); return; }
  if (isNaN(newMinimum) || newMinimum < 0) { alert('Minimum must be zero or positive.'); return; }

  try {
    const url = `${endpoint}?sheet=${encodeURIComponent(currentSheet)}&action=edit&originalItem=${encodeURIComponent(originalItem)}&item=${encodeURIComponent(newItem)}&quantity=${newQuantity}&category=${encodeURIComponent(newCategory)}&minimum=${newMinimum}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      alert('Item updated successfully.');
      loadPantry(currentSheet);
      closeEditModal();
    } else {
      alert('Update failed: ' + data.error);
    }
  } catch (error) {
    alert('Error updating item.');
    console.error(error);
  }
}

// --------- Delete Item ---------
function deleteItem(itemName) {
  if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;
  const url = `${endpoint}?sheet=${encodeURIComponent(currentSheet)}&action=delete&item=${encodeURIComponent(itemName)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) loadPantry(currentSheet);
      else alert('Delete failed: ' + data.error);
    })
    .catch(err => {
      alert('Something went wrong.');
      console.error(err);
    });
}

// --------- Search Handling ---------
let pantryInterval = setInterval(() => loadPantry(currentSheet), 15000);
let resumeTimeout = null;

document.getElementById('searchBox').addEventListener('input', function () {
  const query = this.value.trim().toLowerCase();
  clearInterval(pantryInterval);
  if (resumeTimeout) clearTimeout(resumeTimeout);

  resumeTimeout = setTimeout(() => {
    this.value = '';
    renderPantryList(pantryItems);
    pantryInterval = setInterval(() => loadPantry(currentSheet), 15000);
  }, 20000);

  if (!query) return renderPantryList(pantryItems);

  const filtered = pantryItems.filter(({ item, category }) =>
    item.toLowerCase().includes(query) ||
    (category && category.toLowerCase().includes(query))
  );

  renderPantryList(filtered);
});

// Initial load
loadPantry(currentSheet);
