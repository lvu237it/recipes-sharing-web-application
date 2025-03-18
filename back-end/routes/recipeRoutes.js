/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect } = require('../utils/auth');

// Gọi tới các module xử lý request từ controller
router.get('/', recipeController.getAllRecipes);
router.get('/search', recipeController.searchRecipesByQuery);
router.get('/:recipeId', recipeController.getRecipeById);
router.get('/:recipeId/populate', recipeController.getPopulateRecipeById);
router.post(
  '/recipes-by-categories',
  recipeController.findAllRecipesByCategories
);
router.post('/recipes-by-title', recipeController.findAllRecipesByTitle);
router.post('/create-new-recipe', protect, recipeController.createNewRecipe);
router.patch(
  '/update-recipe/:recipeId',
  protect,
  recipeController.updateRecipe
);
router.patch(
  '/delete-recipe/:recipeId',
  protect,
  recipeController.deleteRecipe
);

module.exports = router;
