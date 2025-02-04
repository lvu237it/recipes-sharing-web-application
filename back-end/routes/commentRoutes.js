const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Create a new comment
router.post("/recipe/:id/create-new-comment", commentController.createComment);

// Get all comments for a specific recipe
router.get("/recipe/:id/comments", commentController.getAllComments);

// Get a specific comment
router.get("/recipe/:id/comment/:id", commentController.getComment);

// Edit a comment
router.put("/recipe/:id/comment/:id/edit", commentController.editComment);

// Delete a comment (soft delete)
router.delete(
  "/recipe/:id/comment/:id/delete",
  commentController.deleteComment
);

module.exports = router;
