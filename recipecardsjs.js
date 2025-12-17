const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';
const pantryEndpoint = "https://script.google.com/macros/s/AKfycbyyltTFmNtNJ5i4C69MMLFdgl7VMV_DK0eH3C4E-0eIisL7f67-5p7Y_vyX0VVZIJVE/exec";

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */

// Generate safe element IDs
function safeId(text) {
  return String(text)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

// Pantry-aware ingredient check
let pantryItems = [];
function ingredientInPantry(line) {
  const lower = line.toLowerCase();
  return pantryItems.some(item => lower.includes(item));
}

// Format ingredients with pantry icons
function formatIngredients(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const inPantry = ingredientInPantry(line);
      const icon = inPantry ? "✔" : "✖";
      const cls = inPantry ? "available" : "missing";
      return `
        <li class="ingredient ${cls}">
          <span class="icon">${icon}</span>
          <span>${line}</span>
        </li>
      `;
    })
    .join("");
}

// Format tags into <span>
function formatTags(text) {
  if (!text) return "";
  return text
    .split(",")
    .map(tag => `<span class="tag">${tag.trim()}</span>`)
    .join("");
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

// Open new recipe modal
function openNewRecipeModal() {
  document.getElementById("newRecipeModal").style.display = "block";
}

/* ---------- Render Recipes ---------- */
let allRecipes = [];

function renderRecipes(recipes) {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";

  recipes.forEach(({ ID, Name, Ingredients, Directions, Tags, RecipeSheet }) => {
    const id = safeId(ID || Name);

    const card = document.createElement("div");
    card.className = "recipe-card";

    const recipeSheetHTML = RecipeSheet ? `<a href="${RecipeSheet}" target="_blank" class="recipe-link">Recipe Sheet</a>` : "";

    card.innerHTML = `
      <h2>${Name}</h2>
      ${recipeSheetHTML}

      <button onclick="toggleIngredients('${id}')">Show Ingredients</button>
      <ul id="ingredients-${id}" style="display:none; margin-top:8px;">
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">Show Directions</button>
      <div id="directions-${id}" style="display:none; margin-top:10px;">
        ${Directions.replace(/\n/g, "<br>")}
      </div>

      <div class="tags">
        ${formatTags(Tags)}
      </div>

      <button onclick="openEditModal('${id}')">Edit Recipe</button>
    `;

    container.appendChild(card);
  });
}

/* ---------- Load Pantry ---------- */
async function loadPantry() {
  try {
    const res = await fetch(pantryEndpoint);
    const data = await res.json();
    pantryItems = data.map(r => (r.Item || "").toLowerCase().trim()).filter(Boolean);
    console.log("Pantry loaded:", pantryItems);
  } catch (err) {
    console.error("Failed to load pantry:", err);
  }
}

/* ---------- Load Recipes ---------- */
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

/* ---------- Add New Recipe ---------- */
async function submitNewRecipe() {
  const name = document.getElementById("newName").value.trim();
  const ingredients = document.getElementById("newIngredients").value.trim();
  const directions = document.getElementById("newDirections").value.trim();
  const tags = document.getElementById("newTags").value.trim();
  const recipeSheet = document.getElementById("newRecipeSheet").value.trim();

  if (!name) { alert("Name required"); return; }

  try {
    const url = `${endpoint}?sheet=Recipes&action=addNewRecipe&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}&RecipeSheet=${encodeURIComponent(recipeSheet)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      alert("Recipe added!");
      document.getElementById("newRecipeModal").style.display = "none";
      document.getElementById("newName").value = "";
      document.getElementById("newIngredients").value = "";
      document.getElementById("newDirections").value = "";
      document.getElementById("newTags").value = "";
      document.getElementById("newRecipeSheet").value = "";
      loadRecipes();
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add recipe.");
  }
}

/* ---------- Edit Recipe ---------- */
function openEditModal(id) {
  const recipe = allRecipes.find(r => safeId(r.ID || r.Name) === id);
  if (!recipe) return;

  document.getElementById("editRow").value = id;
  document.getElementById("editName").value = recipe.Name;
  document.getElementById("editIngredients").value = recipe.Ingredients;
  document.getElementById("editDirections").value = recipe.Directions;
  document.getElementById("editTags").value = recipe.Tags;
  document.getElementById("editRecipeSheet").value = recipe.RecipeSheet || "";

  document.getElementById("editRecipeModal").style.display = "block";
}

async function submitEditRecipe() {
  const id = document.getElementById("editRow").value;
  const name = document.getElementById("editName").value.trim();
  const ingredients = document.getElementById("editIngredients").value.trim();
  const directions = document.getElementById("editDirections").value.trim();
  const tags = document.getElementById("editTags").value.trim();
  const recipeSheet = document.getElementById("editRecipeSheet").value.trim();

  if (!name) { alert("Name required"); return; }

  try {
    const url = `${endpoint}?sheet=Recipes&action=editRecipe&id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}&RecipeSheet=${encodeURIComponent(recipeSheet)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      alert("Recipe updated!");
      document.getElementById("editRecipeModal").style.display = "none";
      loadRecipes();
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to update recipe.");
  }
}

/* ---------- Search Handling ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadPantry();
  await loadRecipes();

  const searchNameBox = document.getElementById("searchName");
  const searchIngredientsBox = document.getElementById("searchIngredients");
  const searchTagsBox = document.getElementById("searchTags");

  let nameTimeout = null;
  let searchTimeout = null;

  // Name search (independent)
  searchNameBox.addEventListener("input", () => {
    if (nameTimeout) clearTimeout(nameTimeout);
    nameTimeout = setTimeout(() => {
      const query = searchNameBox.value.trim().toLowerCase();
      if (!query) { renderRecipes(allRecipes); return; }
      const filtered = allRecipes.filter(r => (r.Name || "").toLowerCase().includes(query));
      renderRecipes(filtered);
    }, 200);
  });

  // Ingredients + Tags combined search
  function handleSearch() {
    const ingredientsQuery = searchIngredientsBox.value.trim().toLowerCase();
    const tagsQuery = searchTagsBox.value.trim().toLowerCase();
    const filtered = allRecipes.filter(r => {
      const ingMatch = !ingredientsQuery || (r.Ingredients || "").toLowerCase().includes(ingredientsQuery);
      const tagsArray = (r.Tags || "").split(",").map(t => t.trim().toLowerCase());
      const tagMatch = !tagsQuery || tagsArray.some(tag => tag.includes(tagsQuery));
      return ingMatch && tagMatch;
    });
    renderRecipes(filtered);
  }

  [searchIngredientsBox, searchTagsBox].forEach(box => {
    box.addEventListener("input", () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(handleSearch, 2000);
    });
  });

  // Add recipe modal button
  document.getElementById("addRecipeBtn").addEventListener("click", openNewRecipeModal);
  document.getElementById("submitNewRecipe").addEventListener("click", submitNewRecipe);

  // Close modals
  document.querySelectorAll(".modal .close").forEach(el => {
    el.addEventListener("click", () => { el.parentElement.parentElement.style.display = "none"; });
  });

  // Close if click outside modal
  window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach(modal => {
      if (e.target === modal) modal.style.display = "none";
    });
  });
});
