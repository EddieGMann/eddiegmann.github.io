const endpoint = 'https://script.google.com/macros/s/AKfycbx451LeCSQZvajuhaqubNPIs1-a52X6D2EQkFnVqUYrJTBcu1Cbh2PKLbdv-j5kfuy7/exec';
  let pantryItems = [];

  async function loadPantry() {
    try {
      const res = await fetch(endpoint);
      pantryItems = await res.json();
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

  items.forEach(({ item, quantity, category }) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <strong>${item}</strong><br />
      <em style="color: gray;">${category}</em><br />
      Quantity: <span id="qty-${item}">${quantity}</span><br />
      <input type="number" id="input-${item}" placeholder="Amount" min="1" />
        <button onclick="adjustItem('${item}', 'add')" style = "background-image: linear-gradient(#F74902, #F74910);margin: 15px; border-radius: 12px; color:black; width: 95px; height: 95px; font-size: 32px;">+</button>
        <button onclick="adjustItem('${item}', 'subtract')">Subtract</button>

    `;
    container.appendChild(div);
  });
}


let pantryInterval = setInterval(loadPantry, 15000); // auto-refresh every 15 sec
let resumeTimeout = null;

document.getElementById('searchBox').addEventListener('input', function () {
  const searchBox = this;
  const query = searchBox.value.trim().toLowerCase();

  // Stop auto-refresh while searching
  clearInterval(pantryInterval);
  if (resumeTimeout) clearTimeout(resumeTimeout);

  // Resume auto-refresh after 20 seconds of inactivity
  resumeTimeout = setTimeout(() => {
    searchBox.value = ''; // Clear the search input
    renderPantryList(pantryItems); // Show full list again
    pantryInterval = setInterval(loadPantry, 15000); // Resume refresh
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


  async function adjustItem(item, action) {
    const input = document.getElementById(`input-${item}`);
    const amount = Number(input.value);
    const validAmount = (amount > 0) ? amount : 1;

    const url = `${endpoint}?item=${encodeURIComponent(item)}&action=${action}&amount=${validAmount}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        loadPantry(); // Refresh the list
        input.value = ''; // Clear the input box
      } else {
        alert('Update failed: ' + data.error);
      }
    } catch (error) {
      alert('Failed to update item.');
      console.error(error);
    }
  }

  async function addNewItem() {
    const input = document.getElementById('newItemInput');
    const newItem = input.value.trim();
    if (!newItem) {
      alert('Please enter a valid item name.');
      return;
    }

    const url = `${endpoint}?action=addNew&item=${encodeURIComponent(newItem)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        pantryItems.push({ item: newItem, quantity: 1 });
        renderPantryList(pantryItems);
        input.value = '';
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to add new item.');
      console.error(error);
    }
  }

  loadPantry();
