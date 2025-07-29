const endpoint = 'https://script.google.com/macros/s/AKfycbxUddjl4JrhwOcqQaINFUElmN3R0jTr1MnWU4cMHuj1SnC2WnttB2USsaTpn-nuZ7YI/exec';
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

    items.forEach(({ item, quantity }) => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <strong>${item}</strong><br />
        Quantity: <span id="qty-${item}">${quantity}</span><br />
        <input type="number" id="input-${item}" placeholder="Amount" min="1" />
        <button onclick="adjustItem('${item}', 'add')">Add</button>
        <button onclick="adjustItem('${item}', 'subtract')">Subtract</button>
      `;
      container.appendChild(div);
    });
  }

  document.getElementById('searchBox').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    if (!query) {
      renderPantryList(pantryItems);
      return;
    }
    const filtered = pantryItems.filter(({ item }) =>
      item.toLowerCase().includes(query)
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
