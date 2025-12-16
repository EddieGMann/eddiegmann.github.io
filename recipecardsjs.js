const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';

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
    .map(line => line.trim())      // remove leading/trailing spaces
    .filter(line => line.length)   // remove empty lines
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

function toggleDirections(id) {
  const el = document.getElementById(`directions-${id}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function toggleIngredients(id) {
  const el = document.getElementById(`ingredients-${id}`);
  const button = el.previousElementSibling; // the button before the <ul>
  
  if (el.style.display === "none") {
    el.style.display = "block";
    button.textContent = "Hide Ingredients";
  } else {
    el.style.display = "none";
    button.textContent = "Show Ingredients";
  }
}


/* ---------- Load + Render ---------- */

async function loadRecipes() {
  try {
    const res = await fetch(`${endpoint}?sheet=Recipes`);
    const recipes = await res.json();
    console.log("Recipes loaded:", recipes);
    renderRecipes(recipes);
  } catch (err) {
    console.error("Failed to load recipes:", err);
  }
}

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


/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", loadRecipes);
