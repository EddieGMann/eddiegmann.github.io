const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';

let allRecipes = []; // global storage

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */
function safeId(text) {
  return String(text).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
}

function formatIngredients(text) {
  if (!text) return "";
  return text.split("\n").map(line => line.trim()).filter(Boolean).map(line => `<li>${line}</li>`).join("");
}

function formatTags(text) {
  if (!text) return "";
  return text.split(",").map(tag => `<span class="tag">${tag.trim()}</span>`).join(" ");
}

function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  const btn = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  btn.textContent = el.style.display === "none" ? "Show Directions" : "Hide Directions";
}

function toggleIngredients(id) {
  const el = document.getElementById(`ingredients-${id}`);
  const btn = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  btn.textContent = el.style.display === "none" ? "Show Ingredients" : "Hide Ingredients";
}

/* ---------- Render Recipes ---------- */
function renderRecipes(recipes) {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
  container.style.gap = "20px";

  recipes.forEach(({ _row, Name, Ingredients, Directions, Tags }) => {
    const id = safeId(Name);

    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <h2 style="text-align:center;">${Name}</h2>

      <button onclick="toggleIngredients('${id}')">Show Ingredients</button>
      <ul id="ingredients-${id}" style="display:none; margin-top:8px;">
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">Show Directions</button>
      <div id="directions-${id}" style="display:none; margin-top:10px;">
        ${Directions.replace(/\n/g, "<br>")}
      </div>

      <div class="tags">${formatTags(Tags)}</div>

      <button class="editBtn" data-row="${_row}" data-name="${Name}" data-ingredients="${Ingredients}" data-directions="${Directions}" data-tags="${Tags}">
        Edit
      </button>
    `;
    container.appendChild(card);
  });

  // Attach edit button events
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset));
  });
}

/* ---------- Load Recipes ---------- */
async function loadRecipes() {
  try {
    const res = await fetch(`${endpoint}?sheet=Recipes`);
    const recipes = await res.json();
    allRecipes = recipes;
    renderRecipes(recipes);
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

/* ---------- Add Recipe ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  // Modal handling
  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const newRecipeModal = document.getElementById("newRecipeModal");
  const closeModal = document.getElementById("closeModal");

  addRecipeBtn.addEventListener("click", () => newRecipeModal.style.display = "block");
  closeModal.addEventListener("click", () => newRecipeModal.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === newRecipeModal) newRecipeModal.style.display = "none"; });

  document.getElementById("submitNewRecipe").addEventListener("click", async () => {
    const name = document.getElementById("newName").value.trim();
    const ingredients = document.getElementById("newIngredients").value.trim();
    const directions = document.getElementById("newDirections").value.trim();
    const tags = document.getElementById("newTags").value.trim();

    if (!name) { alert("Name is required."); return; }

    try {
      const url = `${endpoint}?sheet=Recipes&action=addNewRecipe&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        alert("Recipe added!");
        newRecipeModal.style.display = "none";
        document.getElementById("newName").value = "";
        document.getElementById("newIngredients").value = "";
        document.getElementById("newDirections").value = "";
        document.getElementById("newTags").value = "";
        loadRecipes();
      } else alert("Error: " + data.error);
    } catch (err) { alert("Failed to add recipe."); console.error(err); }
  });

  // ---------- Edit Recipe ----------
  const editModal = document.getElementById("editRecipeModal");
  const closeEditModalBtn = document.getElementById("closeEditModal");
  closeEditModalBtn.addEventListener("click", () => editModal.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === editModal) editModal.style.display = "none"; });

  document.getElementById("submitEditRecipe").addEventListener("click", async () => {
    const row = document.getElementById("editRow").value;
    const name = document.getElementById("editName").value.trim();
    const ingredients = document.getElementById("editIngredients").value.trim();
    const directions = document.getElementById("editDirections").value.trim();
    const tags = document.getElementById("editTags").value.trim();

    if (!row || !name) { alert("Name is required."); return; }

    try {
      const url = `${endpoint}?sheet=Recipes&action=editRecipe&row=${row}&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        alert("Recipe updated!");
        editModal.style.display = "none";
        loadRecipes();
      } else alert("Error: " + data.error);
    } catch (err) { alert("Failed to edit recipe."); console.error(err); }
  });

  // ---------- Search handling ----------
  const searchNameBox = document.getElementById("searchName");
  const searchIngredientsBox = document.getElementById("searchIngredients");
  const searchTagsBox = document.getElementById("searchTags");

  let nameTimeout = null, otherTimeout = null;

  searchNameBox.addEventListener("input", () => {
    if (nameTimeout) clearTimeout(nameTimeout);
    nameTimeout = setTimeout(() => {
      const query = searchNameBox.value.trim().toLowerCase();
      renderRecipes(query ? allRecipes.filter(r => (r.Name || "").toLowerCase().includes(query)) : allRecipes);
    }, 200);
  });

  function handleIngredientsTagsSearch() {
    const ingredientsQuery = searchIngredientsBox.value.trim().toLowerCase();
    const tagsQuery = searchTagsBox.value.trim().toLowerCase();

    renderRecipes(allRecipes.filter(r => {
      const ingredientsMatch = !ingredientsQuery || (r.Ingredients || "").toLowerCase().includes(ingredientsQuery);
      const tagsArray = (r.Tags || "").split(",").map(t => t.trim().toLowerCase());
      const tagsMatch = !tagsQuery || tagsArray.some(t => t.includes(tagsQuery));
      return ingredientsMatch && tagsMatch;
    }));
  }

  [searchIngredientsBox, searchTagsBox].forEach(box => {
    box.addEventListener("input", () => {
      if (otherTimeout) clearTimeout(otherTimeout);
      otherTimeout = setTimeout(handleIngredientsTagsSearch, 200);
    });
  });
});

/* ---------- Open Edit Modal ---------- */
function openEditModal(data) {
  document.getElementById("editRow").value = data.row;
  document.getElementById("editName").value = data.name;
  document.getElementById("editIngredients").value = data.ingredients;
  document.getElementById("editDirections").value = data.directions;
  document.getElementById("editTags").value = data.tags;
  document.getElementById("editRecipeModal").style.display = "block";
}

