const endpoint =
  "https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec";

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */

function safeId(text) {
  return String(text)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

function formatIngredients(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<li>${l}</li>`)
    .join("");
}

function formatTags(text) {
  if (!text) return "";
  return text
    .split(",")
    .map(t => `<span class="tag">${t.trim()}</span>`)
    .join(" ");
}

/* ---------- Toggles ---------- */

function toggleIngredients(id) {
  const el = document.getElementById(`ingredients-${id}`);
  const btn = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  btn.textContent = el.style.display === "none" ? "Show Ingredients" : "Hide Ingredients";
}

function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  const btn = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  btn.textContent = el.style.display === "none" ? "Show Directions" : "Hide Directions";
}

/* ---------- Render ---------- */

function renderRecipes(recipes) {
  const container = document.getElementById("recipeList");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(320px, 1fr))";
  container.style.gap = "20px";

  recipes.forEach(recipe => {
    const {
      Name,
      Ingredients,
      Directions,
      Tags,
      RecipeSheet,
      _row
    } = recipe;

    const id = safeId(Name);

    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <h2 style="text-align:center;">${Name}</h2>

      ${RecipeSheet ? `
        <div style="text-align:center; margin-bottom:8px;">
          <a href="${RecipeSheet}" target="_blank">Recipe Sheet</a>
        </div>
      ` : ""}

      <button onclick="toggleIngredients('${id}')">Show Ingredients</button>
      <ul id="ingredients-${id}" style="display:none;">
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">Show Directions</button>
      <div id="directions-${id}" style="display:none;">
        ${Directions.replace(/\n/g, "<br>")}
      </div>

      <div class="tags">${formatTags(Tags)}</div>

      <button
        onclick='openEditModal(${JSON.stringify({
          row: _row,
          name: Name,
          ingredients: Ingredients,
          directions: Directions,
          tags: Tags,
          recipeSheet: RecipeSheet || ""
        })})'
        style="margin-top:10px;"
      >
        Edit
      </button>
    `;

    container.appendChild(card);
  });
}

/* ---------- Load ---------- */

let allRecipes = [];

async function loadRecipes() {
  try {
    const res = await fetch(`${endpoint}?sheet=Recipes`);
    const data = await res.json();
    allRecipes = data;
    renderRecipes(data);
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

/* ---------- Search ---------- */

function setupSearch() {
  const nameBox = document.getElementById("searchName");
  const ingBox = document.getElementById("searchIngredients");
  const tagBox = document.getElementById("searchTags");

  nameBox.addEventListener("input", () => {
    const q = nameBox.value.toLowerCase().trim();
    if (!q) return renderRecipes(allRecipes);
    renderRecipes(allRecipes.filter(r => (r.Name || "").toLowerCase().includes(q)));
  });

  function combinedSearch() {
    const iq = ingBox.value.toLowerCase().trim();
    const tq = tagBox.value.toLowerCase().trim();

    renderRecipes(allRecipes.filter(r => {
      const iMatch = !iq || (r.Ingredients || "").toLowerCase().includes(iq);
      const tMatch = !tq || (r.Tags || "").toLowerCase().includes(tq);
      return iMatch && tMatch;
    }));
  }

  ingBox.addEventListener("input", combinedSearch);
  tagBox.addEventListener("input", combinedSearch);
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
    `&recipeSheet=${encodeURIComponent(newRecipeSheet.value)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    newRecipeModal.style.display = "none";
    loadRecipes();
  } else {
    alert(data.error || "Failed to add recipe");
  }
}

/* ---------- Edit Recipe ---------- */

function openEditModal(data) {
  editRow.value = data.row;
  editName.value = data.name;
  editIngredients.value = data.ingredients;
  editDirections.value = data.directions;
  editTags.value = data.tags;
  editRecipeSheet.value = data.recipeSheet;

  editRecipeModal.style.display = "block";
}

async function submitEditRecipe() {
  const url =
    `${endpoint}?sheet=Recipes&action=editRecipe` +
    `&row=${editRow.value}` +
    `&name=${encodeURIComponent(editName.value)}` +
    `&ingredients=${encodeURIComponent(editIngredients.value)}` +
    `&directions=${encodeURIComponent(editDirections.value)}` +
    `&tags=${encodeURIComponent(editTags.value)}` +
    `&recipeSheet=${encodeURIComponent(editRecipeSheet.value)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.success) {
    editRecipeModal.style.display = "none";
    loadRecipes();
  } else {
    alert(data.error || "Update failed");
  }
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();
  setupSearch();
});
