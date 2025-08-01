const endpoint = 'https://script.google.com/macros/s/AKfycbyt1w9Wx5ILWvvQCO-27DovhTFcCIJKKRXXH049mUWCbV8CzRZLfrGr1D683sHN33WU/exec';
let pantryItems = [];

function toggleDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown if clicked outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById("categoryDropdown");
  const button = document.getElementById("dropdownToggle");
  if (dropdown && !dropdown.contains(event.target) && (!button || !button.contains(event.target))) {
    dropdown.style.display = 'none';
  }
});

function selectCategory(category) {
  fetch(`${endpoint}?category=${encodeURIComponent(category)}`)
    .then(response => response.json())
    .then(data => {
      console.log("Data from Google Sheet:", data);
      renderPantryList(data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  document.getElementById("categoryDropdown").style.display = "none";
}

function addClickEffect(button) {
  button.classList.add("click-effect");
  setTimeout(() => {
    button.classList.remove("click-effect");
  }, 150);
}

// Helper to create safe IDs by replacing unsafe chars
function makeSafeId(str) {
  return str.replace(/[^\w-]/g, "_");
}

async function loadPantry() {
  try {
    const res = await fetch(endpoint);
    pantryItems = await res.json();
    pantryItems.sort((a, b) => a.item.localeCompare(b.item));
    renderPantryList(pantryItems);
  } catch (error) {
    const container = document.getElementById('pantryList');
    if (container) container.textContent = 'Failed to load pantry data.';
    console.error('Load error:', error);
  }
}

function renderPantryList(items) {
  const container = document.getElementById('pantryList');
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.textContent = 'No items match your search.';
    return;
  }

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  container.style.gap = '20px';

  items.forEach(({ item, quantity, category }) => {
    const safeId = makeSafeId(item);

    const div = document.createElement('div');
    div.className = 'item';
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.borderRadius = '12px';

    // Use createElement and textContent for safety
    const flexDiv = document.createElement('div');
    flexDiv.style.display = 'flex';
    flexDiv.style.alignItems = 'center';
    flexDiv.style.gap = '20px';

    const leftDiv = document.createElement('div');
    leftDiv.style.textAlign = 'left';
    leftDiv.style.width = '160px';
    leftDiv.style.wordWrap = 'break-word';

    const strongEl = document.createElement('strong');
    strongEl.textContent = item;

    const br1 = document.createElement('br');

    const emEl = document.createElement('em');
    emEl.style.color = 'gray';
    emEl.textContent = category || '';

    const br2 = document.createElement('br');

    const qtyText = document.createTextNode(`Quantity: `);
    const qtySpan = document.createElement('span');
    qtySpan.id = `qty-${safeId}`;
    qtySpan.textContent = quantity;

    leftDiv.appendChild(strongEl);
    leftDiv.appendChild(br1);
    leftDiv.appendChild(emEl);
    leftDiv.appendChild(br2);
    leftDiv.appendChild(qtyText);
    leftDiv.appendChild(qtySpan);

    const rightDiv = document.createElement('div');
    rightDiv.style.textAlign = 'center';

    const buttonFlex = document.createElement('div');
    buttonFlex.style.display = 'flex';
    buttonFlex.style.alignItems = 'center';

    // Add button +
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.style.cssText = `
      background-image: linear-gradient(#F74902, #F74910);
      margin-right: 10px;
      border-radius: 12px;
      color: black;
      width: 55px;
      height: 55px;
      font-size: 24px;
      cursor: pointer;
    `;
    addBtn.onclick = () => { adjustItem(item, 'add'); addClickEffect(addBtn); };

    // Subtract button -
    const subtractBtn = document.createElement('button');
    subtractBtn.textContent = '-';
    subtractBtn.style.cssText = `
      background-color: black;
      color: #F74902;
      width: 55px;
      height: 55px;
      font-size: 32px;
      padding-bottom: 5px;
      border-radius: 12px;
      cursor: pointer;
    `;
    subtractBtn.onclick = () => { adjustItem(item, 'subtract'); addClickEffect(subtractBtn); };

    buttonFlex.appendChild(addBtn);
    buttonFlex.appendChild(subtractBtn);

    // Input box for amount
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `input-${safeId}`;
    input.placeholder = 'Amount';
    input.min = '1';
    input.style.cssText = 'width: 75px; margin-top: 10px;';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.style.cssText = `
      background-color: red;
      color: white;
      border: none;
      width: 18px;
      height: 18px;
      font-size: 10px;
      margin-left: 4px;
      cursor: pointer;
    `;
    deleteBtn.onclick = () => { deleteItem(item); addClickEffect(deleteBtn); };

    rightDiv.appendChild(buttonFlex);
    rightDiv.appendChild(input);
    rightDiv.appendChild(deleteBtn);

    flexDiv.appendChild(leftDiv);
    flexDiv.appendChild(rightDiv);

    div.appendChild(flexDiv);
    container.appendChild(div);
  });
}

function deleteItem(itemName) {
  if (!confirm(`Are you sure you want to delete "${itemName}"?`)) return;

  const url = `${endpoint}?action=delete&item=${encodeURIComponent(itemName)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`"${itemName}" deleted successfully.`);
        loadPantry();
      } else {
        alert('Delete failed: ' + data.error);
      }
    })
    .catch(err => {
      console.error('Delete error:', err);
      alert('Something went wrong.');
    });
}

async function adjustItem(item, action) {
  const safeId = makeSafeId(item);
  const input = document.getElementById(`input-${safeId}`);
  const amount = Number(input?.value);
  const validAmount = amount > 0 ? amount : 1;

  const url = `${endpoint}?item=${encodeURIComponent(item)}&action=${action}&amount=${validAmount}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      loadPantry();
      if (input) input.value = '';
    } else {
      alert('Update failed: ' + data.error);
    }
  } catch (error) {
    alert('Failed to update item.');
    console.error(error);
  }
}

function addNewItem() {
  document.getElementById('addItemModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('addItemModal').style.display = 'none';
}

async function submitNewItem() {
  const item = document.getElementById('newItemName').value.trim();
  const category = document.getElementById('newItemCategory').value.trim();

  if (!item) {
    alert("Item Name is required.");
    return;
  }

  const url = `${endpoint}?action=addNew&item=${encodeURIComponent(item)}&category=${encodeURIComponent(category)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      pantryItems.push({ item, quantity: 1, category });
      pantryItems.sort((a, b) => a.item.localeCompare(b.item));
      renderPantryList(pantryItems);
      closeModal();
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    alert("Error adding item.");
    console.error(error);
  }
}

// Search input handling with debounce
let pantryInterval = setInterval(loadPantry, 15000);
let resumeTimeout = null;
let debounceTimeout = null;

const searchBox = document.getElementById('searchBox');
if (searchBox) {
  searchBox.addEventListener('input', function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = searchBox.value.trim().toLowerCase();

      clearInterval(pantryInterval);
      if (resumeTimeout) clearTimeout(resumeTimeout);

      resumeTimeout = setTimeout(() => {
        searchBox.value = '';
        renderPantryList(pantryItems);
        pantryInterval = setInterval(loadPantry, 15000);
      }, 20000);

      if (!query) {
        renderPantryList(pantryItems);
        return;
      }

      const filtered = pantryItems.filter(({ item, category }) =>
        item.toLowerCase().includes(query) ||
        (category && category.toLowerCase().includes(query))
      );

      renderPantryList(filtered);
    }, 200); // debounce 200ms
  });
}

// Initial load
loadPantry();
