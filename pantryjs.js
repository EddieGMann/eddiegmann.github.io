<script>
const endpoint = 'https://script.google.com/macros/s/AKfycbwzTdT70HDv28M-Gk7tDg0Ls2k7lOb6fou1HkodIydU_wsFLnrrSqEitx1BxTO0g1JA/exec';

document.addEventListener('DOMContentLoaded', () => {
  fetchPantry();

  document.getElementById('addItemButton').addEventListener('click', () => {
    const item = prompt('Enter item name:');
    if (!item) return;

    const category = prompt('Enter category:');
    if (category === null) return;

    const url = `${endpoint}?action=addNew&item=${encodeURIComponent(item.trim())}&category=${encodeURIComponent(category.trim())}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchPantry();
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => console.error('Add item error:', err));
  });

  document.getElementById('searchBox').addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    fetchPantry(searchTerm);
  });
});

function fetchPantry(filter = '') {
  fetch(endpoint)
    .then(res => res.json())
    .then(items => {
      const filtered = filter
        ? items.filter(i => i.item.toLowerCase().includes(filter))
        : items;
      renderPantryList(filtered);
    });
}

function renderPantryList(items) {
  const container = document.getElementById('pantryList');
  container.innerHTML = '';

  if (items.length === 0) {
    container.textContent = 'No items match your search.';
    return;
  }

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
  container.style.gap = '20px';

  items.forEach(({ item, quantity, category }) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '10px';
    div.style.padding = '10px';
    div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
    div.style.background = '#fff';

    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px; justify-content: space-between;">
        <div style="width: 160px; word-wrap: break-word;">
          <strong>${item}</strong><br />
          <em style="color: gray;">${category}</em><br />
          Quantity: <span id="qty-${item}">${quantity}</span>
        </div>
        <div style="text-align: center;">
          <div style="display: flex; gap: 10px;">
            <button onclick="adjustItem('${item}', 'add'); addClickEffect(this);" style="background-image: linear-gradient(#F74902, #F74910); border-radius: 12px; color: black; width: 55px; height: 55px; font-size: 24px;">+</button>
            <button onclick="adjustItem('${item}', 'subtract'); addClickEffect(this);" style="background-color: black; color: #F74902; width: 55px; height: 55px; font-size: 32px; padding-bottom: 5px; border-radius: 12px;">-</button>
          </div>
          <input type="number" id="input-${item}" placeholder="Amount" min="1" style="width: 75px; margin-top: 10px;" />
          <br />
          <button onclick="confirmDelete('${item}')" style="margin-top: 10px; background-color: red; color: white; padding: 6px 12px; border: none; border-radius: 8px;">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function adjustItem(item, action) {
  const input = document.getElementById(`input-${item}`);
  const amount = Number(input.value);
  if (!amount || amount <= 0) {
    alert('Enter a valid amount.');
    return;
  }

  const url = `${endpoint}?action=${action}&item=${encodeURIComponent(item)}&amount=${amount}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById(`qty-${item}`).textContent = data.quantity;
        input.value = '';
      } else {
        alert('Error: ' + data.error);
      }
    })
    .catch(err => console.error('Quantity update error:', err));
}

function confirmDelete(itemName) {
  if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
    deleteItem(itemName);
  }
}

function deleteItem(itemName) {
  const url = `${endpoint}?action=delete&item=${encodeURIComponent(itemName)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        fetchPantry();
      } else {
        alert('Delete failed: ' + data.error);
      }
    })
    .catch(err => console.error('Delete error:', err));
}

function addClickEffect(btn) {
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 100);
}
</script>
