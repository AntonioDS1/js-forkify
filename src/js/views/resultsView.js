import View from './View';
import previewView from './previewView';

class ResultsView extends View {
  _parentElement = document.querySelector('.results');
  _errorMessage =
    "Nessuna ricetta trovata con questa ricerca, prova con un'altra!";

  _generateMarkup() {
    const markup = this._data
      .map(rec => {
        previewView._data = rec;
        return previewView._generateMarkup();
      })
      .join('');
    return markup;
  }
}

export default new ResultsView();
