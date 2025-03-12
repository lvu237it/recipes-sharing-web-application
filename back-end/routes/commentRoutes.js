const express = require("express");
const router = express.Router();
const { protect } = require("../utils/auth");
const commentController = require("../controllers/commentController");

// Get all comments for a specific recipe
router.get("/recipe/:recipeId/comments", commentController.getAllComments);

// Admin routes
router.post(
  "/admin/:recipeId/add-comment",
  protect,
  commentController.adminAddComment
);
router.patch(
  "/admin/:recipeId/edit-comment/:commentId",
  protect,
  commentController.adminEditComment
);
router.patch(
  "/admin/:recipeId/delete-comment/:commentId",
  protect,
  commentController.adminDeleteComment
);

// User routes
router.post(
  "/user/:recipeId/add-comment",
  protect,
  commentController.userAddComment
);
router.patch(
  "/user/:recipeId/edit-comment/:commentId",
  protect,
  commentController.userEditComment
);
router.patch(
  "/user/:recipeId/delete-comment/:commentId",
  protect,
  commentController.userDeleteComment
);

module.exports = router;
