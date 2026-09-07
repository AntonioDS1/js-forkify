import View from './View';

class SearchView extends View {
  #parentElement = document.querySelector('.search');

  getQuery() {
    const queryValue =
      this.#parentElement.querySelector('.search__field').value;
    this.#clearInput();
    return queryValue;
  }
  #clearInput() {
    this.#parentElement.querySelector('.search__field').value = '';
  }
  addHandlerSearch(handler) {
    this.#parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
