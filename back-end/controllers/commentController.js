const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const Recipe = require("../models/recipeModel");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all comments for a specific recipe
exports.getAllComments = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const comments = await Comment.find({ recipe: recipeId, isDeleted: false });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

// Admin adds a comment to a recipe
exports.adminAddComment = async (req, res) => {
  try {
    const { adminId, recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(adminId) || !isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid admin or recipe ID" });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(adminId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    const newComment = new Comment({
      content,
      user: adminId,
      recipe: recipeId,
    });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// User adds a comment to a recipe
exports.userAddComment = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid user or recipe ID" });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newComment = new Comment({ content, user: userId, recipe: recipeId });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Admin edits a comment
exports.adminEditComment = async (req, res) => {
  try {
    const { adminId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(adminId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid admin or comment ID" });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const user = await User.findById(adminId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// User edits their own comment
exports.userEditComment = async (req, res) => {
  try {
    const { userId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid user or comment ID" });
    }
    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot edit others' comments" });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Admin soft deletes a comment
exports.adminDeleteComment = async (req, res) => {
  try {
    const { adminId, commentId } = req.params;

    if (!isValidObjectId(adminId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid admin or comment ID" });
    }

    const user = await User.findById(adminId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

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

// User soft deletes their own comment
exports.userDeleteComment = async (req, res) => {
  try {
    const { userId, commentId } = req.params;

    if (!isValidObjectId(userId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid user or comment ID" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Cannot delete others' comments" });
    }

    comment.isDeleted = true;
    comment.deletedAt = Date.now();
    await comment.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
