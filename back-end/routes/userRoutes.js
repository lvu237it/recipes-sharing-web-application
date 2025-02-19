/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Gọi tới các module xử lý request từ controller
// router.post('/create-new-user', userController.createAnUser);
router.get('/:userId', userController.getUserById);
router.get('/:userId/recipes', userController.findAllRecipesByUser);
router.patch('/:userId/edit-information', userController.updateUser);

module.exports = router;
