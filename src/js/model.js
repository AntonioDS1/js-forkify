import { AJAX } from './helpers';
import { API_URL, RES_PER_PAGE, PAGES_SELECTOR_LENGTH, KEY } from './config';
import _ from 'lodash';

export const state = {
  recipe: {},
  search: {
    results: [],
    query: '',
    resPerPage: RES_PER_PAGE,
    pagesSelectorLength: PAGES_SELECTOR_LENGTH,
    page: 1,
  },
  bookmarks: [],
  shoppingList: [],
};

export const craftRecipe = recipeData => {
  const { recipe } = recipeData.data; // La ricetta sta in data.data.recipe, quindi si fa il destructuring
  return {
    // Non ricreiamo più l'oggetto, ma lo impostiamo come state.recipe
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    bookmarked: false,
    ...(recipe.key && { key: recipe.key }),
    isUserGenerated: recipe.key === KEY,
  };
};

export const loadRecipe = async (
  id /* Id che sarà window.location.hash.slice(1) passato dal controller*/,
) => {
  try {
    // Caricare la ricetta

    const recipeData = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = craftRecipe(recipeData);

    state.bookmarks.forEach(b => {
      if (b.id === state.recipe.id) state.recipe.bookmarked = true;
    });
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const craftRecipePreview = recipe => {
  return {
    id: recipe.id,
    publisher: recipe.publisher,
    image: recipe.image_url,
    title: recipe.title,
    ...(recipe.key && { key: recipe.key }),
    isUserGenerated: recipe.key === KEY,
  };
};

export const loadSearchResults = async query => {
  try {
    state.search.query = query;
    const resultsData = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.results = resultsData.data.recipes.map(recipe => {
      return craftRecipePreview(recipe);
    });
    state.search.page = 1;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

export const updateServings = newServings => {
  state.recipe.ingredients = state.recipe.ingredients.map(ing => {
    const minQuantity = ing.quantity / state.recipe.servings;
    return {
      ...ing,
      quantity: minQuantity * newServings,
    };
  });
  state.recipe.servings = newServings;
};

export const addBookmark = () => {
  if (state.recipe.bookmarked) return removeBookmark();
  state.recipe.bookmarked = true;
  const bookmark = craftRecipePreview(state.recipe);
  state.bookmarks.push(bookmark);
  persistBookmarks();
};

export const removeBookmark = () => {
  state.recipe.bookmarked = false;
  state.bookmarks = state.bookmarks.filter(b => b.id != state.recipe.id);
  persistBookmarks();
};

export const getResultsPage = (page = state.search.page) => {
  const start = (page - 1) * state.search.resPerPage;
  const end = start + state.search.resPerPage;
  return state.search.results.slice(start, end);
};

export const persistBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const getPersistedBookmarks = () => {
  const bookmarks = localStorage.getItem('bookmarks');
  if (bookmarks) {
    state.bookmarks = JSON.parse(bookmarks);
  }
};

export const uploadRecipe = async formData => {
  try {
    const newRecipe = Object.fromEntries(
      formData.filter(
        ([key]) => !['quantity', 'unit', 'description'].includes(key),
      ),
    );

    newRecipe.ingredients = formData.reduce((acc, [key, value]) => {
      if (key === 'quantity') {
        acc.push({ quantity: value });
      } else if (key === 'unit') {
        acc.at(-1).unit = value;
      } else if (key === 'description') {
        acc.at(-1).description = value;
      }
      return acc;
    }, []);

    const recipeData = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients: newRecipe.ingredients,
    };
    const sentData = await AJAX(`${API_URL}?key=${KEY}`, recipeData);
    state.recipe = craftRecipe(sentData);
    console.log(sentData);
    console.log(sentData.data.recipe.key);
    state.recipe.isUserGenerated = state.recipe.key === KEY;
    addBookmark();
  } catch (err) {
    throw err;
  }
};

const init = () => {
  getPersistedBookmarks();
};

init();
