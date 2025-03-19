const express = require('express');
const router = express.Router();
const savedRecipeController = require('../controllers/savedRecipeController');
const recipeController = require('../controllers/recipeController');
const { protect } = require('../utils/auth');

router.get('/', protect, savedRecipeController.getAllSavedRecipes);
router.get(
  '/get-all-infor-of-saved-recipe/:savedRecipeId',
  protect,
  savedRecipeController.getInformationOfSavedRecipe
);
router.get(
  '/all-saved-recipes-by-user-id/:saverId',
  protect,
  savedRecipeController.getSavedRecipesBySaverId
);

router.post(
  '/save-to-my-favorite-recipes/:recipeId',
  protect,
  savedRecipeController.saveRecipeToFavoriteList
);
router.delete(
  '/unsave-from-favorite-list/:recipeId',
  protect,
  savedRecipeController.unsaveRecipeFromFavoriteList
);
router.post(
  '/check-is-saved',
  protect,
  savedRecipeController.checkARecipeIsSaved
);

module.exports = router;
