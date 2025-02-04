const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const Recipe = require("../models/recipeModel");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { id: recipeId } = req.params;
    const { author, content } = req.body;

    // Check if the recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Get user details for caching
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newComment = new Comment({
      content,
      author,
      authorUsername: user.username, // Caching username
      authorAvatar: user.avatar, // Caching avatar
      recipePost: recipeId,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Get all comments under a specific recipe
exports.getAllComments = async (req, res) => {
  try {
    const { id: recipeId } = req.params;
    const comments = await Comment.find({
      recipePost: recipeId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

// Get a specific comment
exports.getComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve the comment" });
  }
};

// Edit a comment
exports.editComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content, updatedAt: Date.now() },
      { new: true }
    );

    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Delete a comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
