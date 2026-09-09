import icons from '../../img/icons.svg';

class View {
  _data;
  render(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError(this._errorMessage);

    this._data = data;
    const markup = this._generateMarkup();
    this._insertMarkup(markup);
  }

  update(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError(this._errorMessage);
    this._data = data;
    const markup = this._generateMarkup();

    const fragment = document.createRange().createContextualFragment(markup);

    this._parentElement.replaceChildren(fragment);
  }

  renderSpinner() {
    const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
      `;
    this._insertMarkup(markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `

              <div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>

        `;
    this._insertMarkup(markup);
  }

  renderMessage(message = this._message) {
    const markup = `

              <div class="message">
                <div>
                  <svg>
                    <use href="${icons}#icon-smile"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>

        `;
    this._insertMarkup(markup);
  }

  _insertMarkup(markup) {
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}

export default View;
