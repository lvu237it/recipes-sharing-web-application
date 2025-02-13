/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Gọi tới các module xử lý request từ controller
router.get('/', recipeController.getAllRecipes);
router.get('/:recipeId', recipeController.getRecipeById);
// router.get(
//   '/recipes-by-categories',
//   recipeController.getAllRecipesByCategories
// );
router.post('/create-new-recipe', recipeController.createNewRecipe);
router.patch('/update-recipe/:recipeId', recipeController.updateRecipe);
router.patch('/delete-recipe/:recipeId', recipeController.deleteRecipe);

module.exports = router;
