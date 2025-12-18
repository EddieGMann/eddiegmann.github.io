const endpoint =
  "https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec";

const pantryEndpoint =
  "https://script.google.com/macros/s/AKfycbyyltTFmNtNJ5i4C69MMLFdgl7VMV_DK0eH3C4E-0eIisL7f67-5p7Y_vyX0VVZIJVE/exec";

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */

function safeId(text) {
  return String(text)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
}

/* ---------- Pantry Matching ---------- */

let pantryItems = [];

function ingredientInPantry(line) {
  if (!line) return false;

  const ingredient = normalize(line);

  // Rule 1: Water is always available
  if (ingredient.includes("water")) return true;

  // Rule 2: Oil (any oil matches any oil)
  if (ingredient.includes("oil")) {
    return pantryItems.some(item => normalize(item).includes("oil"));
  }

  // Rule 3: Beans must match specifically
  const beanTypes = [
    "black beans",
    "lima beans",
    "kidney beans",
    "pinto beans",
    "chickpeas",
    "garbanzo beans"
  ];

  for (const bean of beanTypes) {
    if (ingredient.includes(bean)) {
      return pantryItems.some(item =>
        normalize(item).includes(bean)
      );
    }
  }

  // Rule 4: General partial match
  return pantryItems.some(item => {
    const pantryItem = normalize(item);
    return (
      ingredient.includes(pantryItem) ||
      pantryItem.includes(ingredient)
    );
  });
}

/* ---------- Formatting ---------- */

function formatIngredients(text) {
  if (!text) return "";

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const hasItem = ingredientInPantry(line);
      const icon = hasItem ? "✅" : "❌";
      const cls = hasItem ? "available" : "missing";

      return `
        <li class="ingredient ${cls}">
          <span class="icon">${icon}</span>
          <span>${line}</span>
        </li>
      `;
    })
    .join("");
}

function formatTags(text) {
  if (!text) return "";
  return text
    .split(",")
    .map(tag => `<span class="tag">${tag.trim()}</span>`)
    .join("");
}

/* ---------- Toggles ---------- */

function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  const button = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  button.textContent =
    el.style.display === "none" ? "Show Directions" : "Hide Directions";
}

function toggleIngredients(id) {
  const el = document.getElementById(`ingredients-${id}`);
  const button = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  button.textContent =
    el.style.display === "none" ? "Show Ingredients" : "Hide Ingredients";
}

/* ---------- Modals ---------- */

function openNewRecipeModal() {
  document.getElementById("newRecipeModal").style.display = "block";
}

function closeNewRecipeModal() {
  document.getElementById("newRecipeModal").style.display = "none";
}

/* ---------- Render Recipes ---------- */

let allRecipes = [];

function renderRecipes(recipes) {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";

  recipes.forEach(recipe => {
    const { ID, Name, Ingredients, Directions, Tags, RecipeSheet } = recipe;
    const id = safeId(ID || Name);

    const card = document.createElement("div");
    card.className = "recipe-card";

    const recipeSheetHTML = RecipeSheet
      ? `<a href="${RecipeSheet}" target="_blank" class="recipe-sheet-link">Recipe Sheet</a>`
      : "";

    card.innerHTML = `
      <h2>${Name}</h2>
      ${recipeSheetHTML}

      <button onclick="toggleIngredients('${id}')">Show Ingredients</button>
      <ul id="ingredients-${id}" style="display:none;">
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">Show Directions</button>
      <div id="directions-${id}" style="display:none;">
        ${Directions.replace(/\n/g, "<br>")}
      </div>

      <div class="tags">${formatTags(Tags)}</div>

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
    pantryItems = data
      .map(r => r.Item)
      .filter(Boolean);
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
    allRecipes = recipes;
    renderRecipes(recipes);
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

/* ---------- Add Recipe ---------- */

async function submitNewRecipe() {
  const name = newName.value.trim();
  if (!name) return alert("Name required");

  const url =
    `${endpoint}?sheet=Recipes&action=addNewRecipe` +
    `&name=${encodeURIComponent(name)}` +
    `&ingredients=${encodeURIComponent(newIngredients.value)}` +
    `&directions=${encodeURIComponent(newDirections.value)}` +
    `&tags=${encodeURIComponent(newTags.value)}` +
    `&RecipeSheet=${encodeURIComponent(newRecipeSheet.value)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    closeNewRecipeModal();
    newName.value = newIngredients.value = newDirections.value =
      newTags.value = newRecipeSheet.value = "";
    loadRecipes();
  } else alert(data.error);
}

/* ---------- Edit Recipe ---------- */

function openEditModal(id) {
  const recipe = allRecipes.find(r => safeId(r.ID || r.Name) === id);
  if (!recipe) return;

  editRow.value = id;
  editName.value = recipe.Name;
  editIngredients.value = recipe.Ingredients;
  editDirections.value = recipe.Directions;
  editTags.value = recipe.Tags;
  editRecipeSheet.value = recipe.RecipeSheet || "";

  editRecipeModal.style.display = "block";
}

async function submitEditRecipe() {
  const id = editRow.value;

  const url =
    `${endpoint}?sheet=Recipes&action=editRecipe` +
    `&id=${encodeURIComponent(id)}` +
    `&name=${encodeURIComponent(editName.value)}` +
    `&ingredients=${encodeURIComponent(editIngredients.value)}` +
    `&directions=${encodeURIComponent(editDirections.value)}` +
    `&tags=${encodeURIComponent(editTags.value)}` +
    `&RecipeSheet=${encodeURIComponent(editRecipeSheet.value)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    editRecipeModal.style.display = "none";
    loadRecipes();
  } else alert(data.error);
}

/* ---------- Search ---------- */

document.addEventListener("DOMContentLoaded", async () => {
  await loadPantry();
  await loadRecipes();

  searchName.addEventListener("input", () => {
    const q = searchName.value.toLowerCase();
    renderRecipes(
      !q ? allRecipes : allRecipes.filter(r => r.Name.toLowerCase().includes(q))
    );
  });

  submitNewRecipeBtn?.addEventListener("click", submitNewRecipe);

  document.querySelectorAll(".modal .close").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal").style.display = "none";
    });
  });

  window.addEventListener("click", e => {
    document.querySelectorAll(".modal").forEach(m => {
      if (e.target === m) m.style.display = "none";
    });
  });
});
