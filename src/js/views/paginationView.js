import View from './View';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const goTo = Number(btn.dataset.goto);
      handler(goTo);
    });
  }

  _generateMarkup() {
    const numOfPages = Math.ceil(
      this._data.results.length / this._data.resPerPage,
    );

    const curPage = this._data.page;

    const startPage = Math.max(1, curPage - 2);

    const prevBtn = `

          <button class="btn--inline pagination__btn--prev" data-goto="${curPage - 1}">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>

      `;

    const pagesSelector = `

      <div class="pages-list">

        ${Array.from({ length: this._data.pagesSelectorLength }, (_, i) => {
          const page = startPage + i;
          return `${
            page <= numOfPages
              ? `
            <button class="page-index ${page === curPage ? 'active-index' : ''}" data-goto="${page}">
              ${page}
            </button>`
              : ''
          }`;
        }).join('')}
        <button class="page-index ${numOfPages - 1 <= curPage ? 'none' : ''}" data-goto="${numOfPages}">
          ...${numOfPages}
        </button>
      </div>

    `;

    const nextBtn = `

          <button class="btn--inline pagination__btn--next" data-goto="${curPage + 1}">
            <span>Page ${curPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </button>

      `;
    if (numOfPages === 1) return '';

    if (curPage === 1) return pagesSelector + nextBtn;
    if (curPage >= numOfPages) return prevBtn + pagesSelector;

    return prevBtn + pagesSelector + nextBtn;
  }
}

export default new PaginationView();
