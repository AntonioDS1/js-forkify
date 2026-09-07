import View from './View';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _ingredientsContainer = document.querySelector('.ingredients-container');
  _successMessage = 'Ricetta caricata correttamente!';
  _ingredientCount = 0;

  addHandlerToggleWindow() {
    [this._overlay, this._btnOpen, this._btnClose].forEach(el =>
      el.addEventListener('click', this._toggleWindow.bind(this)),
    );
  }

  addHandlerAddIngredient() {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.btn--add-ingredient');
      if (!btn) return;
      this._addIngredient();
    });
  }

  addHandlerRemoveIngredient() {
    this._parentElement.addEventListener('click', e => {
      const btn = e.target.closest('.btn--remove-ingredient');
      if (!btn) return;
      e.target.closest('.ingredient-row').remove();
    });
  }

  addHandlerUploadRecipe(handler) {
    this._parentElement.addEventListener('submit', e => {
      e.preventDefault();
      this._toggleWindow();
      this._ingredientCount = 0;
      handler(Array.from(new FormData(this._parentElement)));
    });
  }

  _toggleWindow() {
    [this._window, this._overlay].forEach(el => el.classList.toggle('hidden'));
  }

  _addIngredient() {
    const id = ++this._ingredientCount;
    const markup = `
      <div class="ingredient-row">
        <input type="number" step="any" name="quantity" placeholder="Quantity" />
        <input type="text" name="unit" placeholder="Unit" />
        <input type="text" name="description" placeholder="Description" required />
        <button type="button" class="btn--remove-ingredient">×</button>
      </div
    `;
    this._ingredientsContainer.insertAdjacentHTML('beforeend', markup);
  }
}

export default new AddRecipeView();
