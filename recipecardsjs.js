const endpoint = 'https://script.google.com/macros/s/AKfycbzL6H9zeY-JmFYZmegpRME6dNK7_zrU90A7HDYP3RRL7x7Pj7lPkfS9srre5E-fIEdY/exec';
let pantryItems = [];
let currentSheet = 'Recipes'; // default


function renderRecipes(recipes) {
  const container = document.getElementById('recipeList');
  container.innerHTML = '';

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  container.style.gap = '20px';

  recipes.forEach(({ ID, Name, Ingredients, Directions, Tags }) => {
    const id = safeId(ID || Name);

    const card = document.createElement('div');
    card.className = 'recipe-card';

    card.innerHTML = `
      <h2 style="text-align:center;">${Name}</h2>

      <ul>
        ${formatIngredients(Ingredients)}
      </ul>

      <button onclick="toggleDirections('${id}')">
        Show Directions
      </button>

      <div id="directions-${id}" style="display:none; margin-top:10px;">
        ${Directions.replace(/\n/g, '<br>')}
      </div>

      <div class="tags">
        ${formatTags(Tags)}
      </div>
    `;

    container.appendChild(card);
  });
}

