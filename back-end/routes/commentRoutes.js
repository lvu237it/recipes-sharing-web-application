const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Get all comments for a specific recipe
router.get("/recipe/:recipeId/comments", commentController.getAllComments);

// Admin routes
router.post(
  "/admin/:adminId/recipe/:recipeId/add-comment",
  commentController.adminAddComment
);
router.patch(
  "/admin/:adminId/recipe/:recipeId/edit-comment/:commentId",
  commentController.adminEditComment
);
router.patch(
  "/admin/:adminId/recipe/:recipeId/delete-comment/:commentId",
  commentController.adminDeleteComment
);

// User routes
router.post(
  "/user/:userId/recipe/:recipeId/add-comment",
  commentController.userAddComment
);
router.patch(
  "/user/:userId/recipe/:recipeId/edit-comment/:commentId",
  commentController.userEditComment
);
router.patch(
  "/user/:userId/recipe/:recipeId/delete-comment/:commentId",
  commentController.userDeleteComment
);

module.exports = router;
