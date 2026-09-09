import { API_URL } from './config';

import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import '../sass/main.scss';

const recipeContainer = document.querySelector('.recipe');

/*

  INSTALLING PARCER 2:

    npm install -D parcel@2 sass

  INSTALLING POLYFILLS:

    npm i core-js regenerator-runtime

*/

/////////////////////////////////////////////////////////

/*

  MVC ARCHITECTURE:

    Permette di ottenere struttura, manutenzione ed espandibilità

    Componenti di qualunque architettura:

      Business logic: Codice che risolve i problemi di business (mandare messaggi in WhatsApp, o conservare le transazioni in una banca)

      State: Conserva tutti i dati dell'applicazione di cui il front-end ha bisogno per lavorare (dati fetchati o inputtati dall'utente; single source of thruth); se qualcosa cambia nello stato, qualcosa deve cambiare nella UI e viceversa

      Http library: Responsabile nel fare richieste AJAX

      Application Logic (Router): Codice tecnico per far funzionare l'applicazione (Gestire la navigazione e l'UI)

      Presentation Logic (UI Layer): Gestisce la parte visibile dell'applicazione

    M V C => MODEL VIEW CONTROLLER:

      View: Si occupa della Presentation logic, l'interazione con l'utente.

      Model: Contiene la Business Logic e lo State, e contiene anche l'http library e comunica con il web.

      Controller: Controlla l'Application Logic, e permette al Model di comunicare con la View senza che si conoscano.

    E. g. => Un click sull'UI viene gestito dal controller, che assegna compiti al Model per modificare lo stato, o fare richieste. Il risultato verrà prelevato dal controller e mandato alla View, che lo renderizzerà alla UI;

      Quando l'utente esegue un click, gestito dal controller tramite handler sulla view, esempio un search result, il controller dirà alla view di renderizzare lo spinner, e chiamerà una funzione del model per andare a prendere i dati della ricetta.
      Il model li metterà nello State, e il controller lo prende, e chiama il metodo render() della View.

*/

/*

   RIFATTORIZZARE IN MVC:

    Iniziare creando l'oggetto State nel Model:

      Posizionare nel Model il codice dedicato al fetch della ricetta, passando l'id hash dal controller con await model.loadRecipe(id);

    Creare la View:

      Creiamo recipeView per la seconda parte di showRecipe. RecipeView sarà una classe

*/

/*

 SPINNER SCSS:

  .spinner {
    height: 6rem;
    width: 6rem;
    fill: #f38382;
    animation: rotate 2s infinite linear;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

*/

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    // Carica la ricetta tramite Model

    await model.loadRecipe(id); // Dice al model di cercare la ricetta e metterla nel suo state

    // Renderizza la ricetta tramite View

    recipeView.render(model.state.recipe); // Render accetta il dato sallo state del model e lo conserva dentro l'oggetto della view
    if (model.state.search.results.length)
      resultsView.update(model.getResultsPage());
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async () => {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    await model.loadSearchResults(query);
    resultsView.render(model.getResultsPage());
    paginationView.render(model.state.search);
  } catch (err) {
    resultsView.renderError();
  }
};

const controlPagination = goTo => {
  model.state.search.page = goTo;
  resultsView.update(model.getResultsPage());
  paginationView.update(model.state.search);
};

const controlServings = newServings => {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  model.addBookmark();
  recipeView.update(model.state.recipe);
  bookmarksView.update(model.state.bookmarks);
};

const controlBookmarks = () => {
  if (model.state.bookmarks.length) bookmarksView.render(model.state.bookmarks);
};

const controlUploadRecipe = async formData => {
  await model.uploadRecipe(formData);
  history.pushState(null, '', `#${model.state.recipe.id}`);
  bookmarksView.update(model.state.bookmarks);
  recipeView.render(model.state.recipe);
};

const init = () => {
  recipeView.addHandlerRender(controlRecipes); // controlRecipes sarà l'handler passato alla View per il render della ricetta.
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  bookmarksView.addHandlerBookmarks(controlBookmarks);
  addRecipeView.addHandlerToggleWindow();
  addRecipeView.addHandlerAddIngredient();
  addRecipeView.addHandlerRemoveIngredient();
  addRecipeView.addHandlerUploadRecipe(controlUploadRecipe);
};

init(); // La maggior parte degli handler saranno chiamati all'inizio
