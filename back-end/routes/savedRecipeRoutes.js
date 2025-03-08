const express = require('express');
const router = express.Router();
const savedRecipeController = require('../controllers/savedRecipeController');
const recipeController = require('../controllers/recipeController');

router.get('/', savedRecipeController.getAllSavedRecipes);
router.get(
  '/get-all-infor-of-saved-recipe/:savedRecipeId',
  savedRecipeController.checkIfSavedRecipeIsExist,
  savedRecipeController.getInformationOfSavedRecipe
);
router.get(
  '/all-saved-recipes-by-user-id/:saverId',
  // savedRecipeController.checkSaverIsExist,
  savedRecipeController.getSavedRecipesBySaverId
);

router.post(
  '/save-to-my-favorite-recipes/:recipeId',
  recipeController.checkIfRecipeIsExist,
  savedRecipeController.saveRecipeToFavoriteList
);
router.delete(
  '/unsave-from-favorite-list/:recipeId',
  recipeController.checkIfRecipeIsExist,
  savedRecipeController.unsaveRecipeFromFavoriteList
);
router.post('/check-is-saved', savedRecipeController.checkARecipeIsSaved);

module.exports = router;
