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
  const container = document.getElementById('pantryList'); // <- updated here
  container.innerHTML = ''; // clear existing content

  items.forEach(({ item, quantity, category }) => {
    const div = document.createElement('div');
    div.className = 'pantry-item';
    div.style.cssText = `
      background-color: #f3f3f3;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 10px;
      position: relative;
    `;

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="text-align: left; width: 160px; word-wrap: break-word;">
          <strong>${item}</strong><br />
          <em style="color: gray;">${category || ''}</em><br />
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
        </div>
      </div>
    `;

    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.style.cssText = `
      background-color: red;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 14px;
      cursor: pointer;
      position: absolute;
      top: 8px;
      right: 8px;
    `;

    deleteBtn.onclick = () => {
      const confirmed = confirm(`Are you sure you want to delete "${item}"?`);
      if (confirmed) {
        deleteItem(item, div); // <- assumes you have this function
      }
    };

    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
}


function deleteItem(itemName, cardElement) {
  const url = `${scriptURL}?action=delete&item=${encodeURIComponent(itemName)}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        cardElement.remove(); // remove the item from the page
      } else {
        alert('Error deleting item: ' + data.error);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Failed to delete item.');
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
  function deleteItem(item, element) {
fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        element.remove(); // Remove the item's div from the DOM
        console.log(`Deleted: ${item}`);
      } else {
        alert(`Error deleting item: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Request failed', error);
      alert('Error deleting item. Please try again.');
    });
}
  const filtered = pantryItems.filter(({ item, category }) =>
    item.toLowerCase().includes(query) ||
    (category && category.toLowerCase().includes(query))
  );

  renderPantryList(filtered);
});

// Initial load
loadPantry();
