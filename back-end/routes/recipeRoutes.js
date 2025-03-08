/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Gọi tới các module xử lý request từ controller
router.get('/', recipeController.getAllRecipes);
router.get('/:recipeId', recipeController.getRecipeById);
router.post(
  '/recipes-by-categories',
  recipeController.findAllRecipesByCategories
);
router.post('/recipes-by-title', recipeController.findAllRecipesByTitle);
router.post('/create-new-recipe', recipeController.createNewRecipe);
router.patch('/update-recipe/:recipeId', recipeController.updateRecipe);
router.patch(
  '/delete-recipe/:recipeId',
  recipeController.checkIfRecipeIsExist,
  recipeController.deleteRecipe
);

module.exports = router;
