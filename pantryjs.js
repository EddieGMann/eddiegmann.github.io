
const endpoint = 'https://script.google.com/macros/s/AKfycbwzTdT70HDv28M-Gk7tDg0Ls2k7lOb6fou1HkodIydU_wsFLnrrSqEitx1BxTO0g1JA/exec';
let pantryItems = [];

function addClickEffect(button) {
  button.classList.add("click-effect");
  setTimeout(() => {
    button.classList.remove("click-effect");
  }, 150);
}

async function loadPantry() {
  try {
    const res = await fetch(endpoint);
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

  items.forEach(({ item, quantity, category }) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    div.style.borderRadius = '12px';

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="text-align: left; width: 160px; word-wrap: break-word;">
          <strong>${item}</strong><br />
          <em style="color: gray;">${category}</em><br />
          Quantity: <span id="qty-${item}">${quantity}</span>
        </div>
        <div style="text-align: center;">
          <div style="display: flex; align-items: center;">
            <button onclick="adjustItem('${item.replace(/'/g, "\\'")}', 'add'); addClickEffect(this);"
              style="background-image: linear-gradient(#F74902, #F74910); margin-right: 10px; border-radius: 12px; color:black; width: 55px; height: 55px; font-size: 24px;">+</button>
            <button onclick="adjustItem('${item.replace(/'/g, "\\'")}', 'subtract'); addClickEffect(this);"
              style="background-color: black; color:#F74902; width: 55px; height: 55px; font-size: 32px; padding-bottom: 5px; border-radius: 12px;">-</button>
          </div>
          <input type="number" id="input-${item}" placeholder="Amount" min="1"
            style="width: 75px; margin-top: 10px;" />
            		<button style = "background-color: red; color: white; border: none; width: 18px; height: 18px; font-size: 10px; margin-left: 4px; cursor: pointer;">✕</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

async function adjustItem(item, action) {
  const input = document.getElementById(`input-${item}`);
  const amount = Number(input.value);
  const validAmount = amount > 0 ? amount : 1;

  const url = `${endpoint}?item=${encodeURIComponent(item)}&action=${action}&amount=${validAmount}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      loadPantry();
      input.value = '';
    } else {
      alert('Update failed: ' + data.error);
    }
  } catch (error) {
    alert('Failed to update item.');
    console.error(error);
  }
}

async function addNewItem() {
  const item = prompt("Enter the item name:");
  if (!item || item.trim() === "") {
    alert("Item name is required.");
    return;
  }

  const category = prompt("Enter the category (optional):") || "";

  const url = `${endpoint}?action=addNew&item=${encodeURIComponent(item.trim())}&category=${encodeURIComponent(category.trim())}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      pantryItems.push({ item: item.trim(), quantity: 1, category: category.trim() });
      pantryItems.sort((a, b) => a.item.localeCompare(b.item));
      renderPantryList(pantryItems);
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    alert("Failed to add new item.");
    console.error(error);
  }
}

// Search input handling
let pantryInterval = setInterval(loadPantry, 15000);
let resumeTimeout = null;

document.getElementById('searchBox').addEventListener('input', function () {
  const searchBox = this;
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
});

// Initial load
loadPantry();
