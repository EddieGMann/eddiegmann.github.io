const endpoint =
  "https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec";

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */

function safeId(text) {
  return String(text)
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");
}

/* ---------- Formatting ---------- */

function formatIngredients(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<li>${line}</li>`)
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

      <div class="tags">
        ${formatTags(Tags)}
      </div>

      <button onclick="openEditModal('${id}')">Edit Recipe</button>
    `;

    container.appendChild(card);
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

/* ---------- Add New Recipe ---------- */

async function submitNewRecipe() {
  const name = newName.value.trim();
  const ingredients = newIngredients.value.trim();
  const directions = newDirections.value.trim();
  const tags = newTags.value.trim();
  const recipeSheet = newRecipeSheet.value.trim();

  if (!name) {
    alert("Name is required");
    return;
  }

  const url =
    `${endpoint}?sheet=Recipes&action=addNewRecipe` +
    `&name=${encodeURIComponent(name)}` +
    `&ingredients=${encodeURIComponent(ingredients)}` +
    `&directions=${encodeURIComponent(directions)}` +
    `&tags=${encodeURIComponent(tags)}` +
    `&RecipeSheet=${encodeURIComponent(recipeSheet)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      closeNewRecipeModal();
      newName.value = "";
      newIngredients.value = "";
      newDirections.value = "";
      newTags.value = "";
      newRecipeSheet.value = "";
      loadRecipes();
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to add recipe");
  }
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

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      editRecipeModal.style.display = "none";
      loadRecipes();
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to update recipe");
  }
}

/* ---------- Search ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  searchName.addEventListener("input", () => {
    const query = searchName.value.toLowerCase();
    renderRecipes(
      !query
        ? allRecipes
        : allRecipes.filter(r =>
            (r.Name || "").toLowerCase().includes(query)
          )
    );
  });

  searchIngredients.addEventListener("input", handleCombinedSearch);
  searchTags.addEventListener("input", handleCombinedSearch);

  function handleCombinedSearch() {
    const ingQ = searchIngredients.value.toLowerCase();
    const tagQ = searchTags.value.toLowerCase();

    const filtered = allRecipes.filter(r => {
      const ingMatch =
        !ingQ ||
        (r.Ingredients || "").toLowerCase().includes(ingQ);

      const tagMatch =
        !tagQ ||
        (r.Tags || "")
          .toLowerCase()
          .split(",")
          .some(t => t.includes(tagQ));

      return ingMatch && tagMatch;
    });

    renderRecipes(filtered);
  }

  document
    .querySelectorAll(".modal .close")
    .forEach(btn =>
      btn.addEventListener("click", () => {
        btn.closest(".modal").style.display = "none";
      })
    );

  window.addEventListener("click", e => {
    document.querySelectorAll(".modal").forEach(modal => {
      if (e.target === modal) modal.style.display = "none";
    });
  });
});
