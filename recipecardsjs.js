const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */

// Generate safe element IDs
function safeId(text) {
  return String(text)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

// Format ingredients into <li>
function formatIngredients(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length)
    .map(line => `<li>${line}</li>`)
    .join("");
}

// Format tags into <span>
function formatTags(text) {
  if (!text) return "";
  return text
    .split(",")
    .map(tag => `<span class="tag">${tag.trim()}</span>`)
    .join(" ");
}

// Toggle directions visibility
function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  const button = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  button.textContent = el.style.display === "none" ? "Show Directions" : "Hide Directions";
}

// Toggle ingredients visibility
function toggleIngredients(id) {
  const el = document.getElementById(`ingredients-${id}`);
  const button = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  button.textContent = el.style.display === "none" ? "Show Ingredients" : "Hide Ingredients";
}

/* ---------- Render Recipes ---------- */

function renderRecipes(recipes) {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";

  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
  container.style.gap = "20px";

  recipes.forEach(({ Name, Ingredients, Directions, Tags, RecipeSheet, _row }) => {
    const id = safeId(Name + _row);

    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <h2 style="text-align:center;">${Name}</h2>
      ${RecipeSheet ? `<div style="text-align:center; margin-bottom:8px;"><a href="${RecipeSheet}" target="_blank">Recipe Sheet</a></div>` : ''}

      <button onclick="toggleIngredients('${id}')">Show Ingredients</button>
      <ul id="ingredients-${id}" style="display:none; margin-top:8px;">
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">Show Directions</button>
      <div id="directions-${id}" style="display:none; margin-top:10px;">
        ${Directions.replace(/\n/g, "<br>")}
      </div>

      <div class="tags">${formatTags(Tags)}</div>

      <button class="editBtn" data-row="${_row}" data-name="${Name}" data-ingredients="${Ingredients}" data-directions="${Directions}" data-tags="${Tags}" data-recipeSheet="${RecipeSheet || ''}">
        Edit
      </button>
    `;

    container.appendChild(card);
  });

  // Attach edit button listeners
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal({
      row: btn.dataset.row,
      name: btn.dataset.name,
      ingredients: btn.dataset.ingredients,
      directions: btn.dataset.directions,
      tags: btn.dataset.tags,
      recipeSheet: btn.dataset.recipeSheet
    }));
  });
}

/* ---------- Load Recipes ---------- */

let allRecipes = [];

async function loadRecipes() {
  try {
    const res = await fetch(`${endpoint}?sheet=Recipes`);
    const recipes = await res.json();
    console.log("Recipes loaded:", recipes);

    allRecipes = recipes;
    renderRecipes(recipes);
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

/* ---------- Add / Edit Modals ---------- */

function openEditModal(data) {
  document.getElementById("editRow").value = data.row;
  document.getElementById("editName").value = data.name;
  document.getElementById("editIngredients").value = data.ingredients;
  document.getElementById("editDirections").value = data.directions;
  document.getElementById("editTags").value = data.tags;
  document.getElementById("editRecipeSheet").value = data.recipeSheet || '';
  document.getElementById("editRecipeModal").style.display = "block";
}

/* ---------- DOM Loaded ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  // Add Recipe Modal
  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const newRecipeModal = document.getElementById("newRecipeModal");
  const closeModal = document.getElementById("closeModal");

  addRecipeBtn.addEventListener("click", () => newRecipeModal.style.display = "block");
  closeModal.addEventListener("click", () => newRecipeModal.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === newRecipeModal) newRecipeModal.style.display = "none"; });

  // Search boxes
  const searchNameBox = document.getElementById("searchName");
  const searchIngredientsBox = document.getElementById("searchIngredients");
  const searchTagsBox = document.getElementById("searchTags");

  let nameSearchTimeout = null;
  let searchTimeout = null;

  // Name search
  searchNameBox.addEventListener("input", () => {
    if (nameSearchTimeout) clearTimeout(nameSearchTimeout);
    nameSearchTimeout = setTimeout(() => {
      const query = searchNameBox.value.trim().toLowerCase();
      if (!query) return renderRecipes(allRecipes);

      const filtered = allRecipes.filter(recipe =>
        (recipe.Name || "").toLowerCase().includes(query)
      );
      renderRecipes(filtered);
    }, 200);
  });

  // Ingredients + Tags combined search
  function handleIngredientsTagsSearch() {
    const ingredientsQuery = searchIngredientsBox.value.trim().toLowerCase();
    const tagsQuery = searchTagsBox.value.trim().toLowerCase();

    const filtered = allRecipes.filter(recipe => {
      const ingredientsMatch = !ingredientsQuery || (recipe.Ingredients || "").toLowerCase().includes(ingredientsQuery);
      const tagsArray = (recipe.Tags || "").split(",").map(t => t.trim().toLowerCase());
      const tagsMatch = !tagsQuery || tagsArray.some(tag => tag.includes(tagsQuery));
      return ingredientsMatch && tagsMatch;
    });

    renderRecipes(filtered);
  }

  [searchIngredientsBox, searchTagsBox].forEach(box => {
    box.addEventListener("input", () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(handleIngredientsTagsSearch, 200);
    });
  });
});

/* ---------- Add New Recipe ---------- */

document.getElementById("submitNewRecipe").addEventListener("click", async () => {
  const name = document.getElementById("newName").value.trim();
  const ingredients = document.getElementById("newIngredients").value.trim();
  const directions = document.getElementById("newDirections").value.trim();
  const tags = document.getElementById("newTags").value.trim();
  const recipeSheet = document.getElementById("newRecipeSheet").value.trim();

  if (!name) { alert("Name is required."); return; }

  try {
    const url = `${endpoint}?sheet=Recipes&action=addNewRecipe&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}&recipeSheet=${encodeURIComponent(recipeSheet)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      alert("Recipe added successfully!");
      document.getElementById("newRecipeModal").style.display = "none";
      document.getElementById("newName").value = "";
      document.getElementById("newIngredients").value = "";
      document.getElementById("newDirections").value = "";
      document.getElementById("newTags").value = "";
      document.getElementById("newRecipeSheet").value = "";
      loadRecipes();
    } else {
      alert("Error adding recipe: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add recipe.");
  }
});

/* ---------- Edit Existing Recipe ---------- */

document.getElementById("submitEditRecipe").addEventListener("click", async () => {
  const row = document.getElementById("editRow").value;
  const name = document.getElementById("editName").value.trim();
  const ingredients = document.getElementById("editIngredients").value.trim();
  const directions = document.getElementById("editDirections").value.trim();
  const tags = document.getElementById("editTags").value.trim();
  const recipeSheet = document.getElementById("editRecipeSheet").value.trim();

  if (!name) { alert("Name is required."); return; }

  try {
    const url = `${endpoint}?sheet=Recipes&action=editRecipe&row=${row}&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}&recipeSheet=${encodeURIComponent(recipeSheet)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      alert("Recipe updated successfully!");
      document.getElementById("editRecipeModal").style.display = "none";
      loadRecipes();
    } else {
      alert("Error updating recipe: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to update recipe.");
  }
});
