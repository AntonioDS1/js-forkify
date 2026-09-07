import View from './View';
import previewView from './previewView';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage =
    'Nessuna ricetta è stata segnata! Trova una ricetta che ti piace e segnala! ;)';

  addHandlerBookmarks(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    const markup = this._data
      .map(b => {
        previewView._data = b;
        return previewView._generateMarkup();
      })
      .join('');
    return markup;
  }
}

export default new BookmarksView();
