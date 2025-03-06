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
router.post(
  '/save-to-my-favorite-recipes/:recipeId',
  recipeController.checkIfRecipeIsExist,
  savedRecipeController.saveRecipeToFavoriteList
);

module.exports = router;
