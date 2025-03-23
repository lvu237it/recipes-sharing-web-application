// commentRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../utils/auth');
const commentController = require('../controllers/commentController');

// Get all comments for a specific recipe
router.get('/recipe/:recipeId/comments', commentController.getAllComments);

// Admin routes
router.post(
  '/admin/recipe/:recipeId/add-comment',
  protect,
  commentController.adminAddComment
);
router.patch(
  '/admin/recipe/:recipeId/edit-comment/:commentId',
  protect,
  commentController.adminEditComment
);
router.patch(
  '/admin/recipe/:recipeId/delete-comment/:commentId',
  protect,
  commentController.adminDeleteComment
);

// http://localhost:3000/comments/user/recipe/6794bfbdb8d7662c4cef9ab6/delete-comment/67e023a

// User routes
router.post(
  '/user/recipe/:recipeId/add-comment',
  protect,
  commentController.userAddComment
);
router.patch(
  '/user/recipe/:recipeId/edit-comment/:commentId',
  protect,
  commentController.userEditComment
);
router.patch(
  '/user/recipe/:recipeId/delete-comment/:commentId',
  protect,
  commentController.userDeleteComment
);

module.exports = router;
