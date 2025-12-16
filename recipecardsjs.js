const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';

console.log("Recipe JS loaded");

/* ---------- Helpers ---------- */
function safeId(text) {
  return String(text).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
}

function formatIngredients(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length)
    .map(line => `<li>${line}</li>`)
    .join("");
}

function formatTags(text) {
  if (!text) return "";
  return text
    .split(",")
    .map(tag => `<span class="tag">${tag.trim()}</span>`)
    .join(" ");
}

function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  const button = el.previousElementSibling;
  el.style.display = el.style.display === "none" ? "block" : "none";
  button.textContent = el.style.display === "none" ? "Show Directions" : "Hide Directions";
}

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

  recipes.forEach(({ ID, Name, Ingredients, Directions, Tags }) => {
    const id = safeId(ID || Name);

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

      <div class="tags">
        ${formatTags(Tags)}
      </div>
    `;

    container.appendChild(card);
  });
}

/* ---------- Load Recipes ---------- */
let allRecipes = []; // global storage

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

/* ---------- Initialize & Event Listeners ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadRecipes();

  // Modal elements
  const addRecipeBtn = document.getElementById("addRecipeBtn");
  const newRecipeModal = document.getElementById("newRecipeModal");
  const closeModal = document.getElementById("closeModal");
  const submitNewRecipeBtn = document.getElementById("submitNewRecipe");

  // Open modal
  addRecipeBtn.addEventListener("click", () => {
    newRecipeModal.style.display = "block";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    newRecipeModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === newRecipeModal) {
      newRecipeModal.style.display = "none";
    }
  });

  // Search inputs
  const searchNameBox = document.getElementById("searchName");
  const searchIngredientsBox = document.getElementById("searchIngredients");
  const searchTagsBox = document.getElementById("searchTags");

  let nameSearchTimeout = null;
  let searchTimeout = null;

  // Name search (independent)
  searchNameBox.addEventListener("input", () => {
    if (nameSearchTimeout) clearTimeout(nameSearchTimeout);
    nameSearchTimeout = setTimeout(() => {
      const query = searchNameBox.value.trim().toLowerCase();
      if (!query) {
        renderRecipes(allRecipes);
        return;
      }

      const filtered = allRecipes.filter(recipe =>
        (recipe.Name || "").toLowerCase().includes(query)
      );

      renderRecipes(filtered);
    }, 200);
  });

  // Ingredients + Tags search (combined)
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

  // Submit new recipe
  submitNewRecipeBtn.addEventListener("click", async () => {
    const name = document.getElementById("newName").value.trim();
    const ingredients = document.getElementById("newIngredients").value.trim();
    const directions = document.getElementById("newDirections").value.trim();
    const tags = document.getElementById("newTags").value.trim();

    if (!name) {
      alert("Name is required.");
      return;
    }

    try {
      const url = `${endpoint}?sheet=Recipes&action=addNewRecipe&name=${encodeURIComponent(name)}&ingredients=${encodeURIComponent(ingredients)}&directions=${encodeURIComponent(directions)}&tags=${encodeURIComponent(tags)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        alert("Recipe added successfully!");
        newRecipeModal.style.display = "none";

        // Clear inputs
        document.getElementById("newName").value = "";
        document.getElementById("newIngredients").value = "";
        document.getElementById("newDirections").value = "";
        document.getElementById("newTags").value = "";

        // Reload recipes
        loadRecipes();
      } else {
        alert("Error adding recipe: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add recipe.");
    }
  });
});
