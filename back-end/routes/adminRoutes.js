const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../utils/auth');

//Router for business logic here
//default: /admin

router.get('/recipes', protect, adminController.getAllRecipe);

module.exports = router;
