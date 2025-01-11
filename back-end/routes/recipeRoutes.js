/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Gọi tới các module xử lý request từ controller
router.get('/', recipeController.getAllRecipes);
router.post('/create-new-recipe', recipeController.createNewRecipe);

module.exports = router;