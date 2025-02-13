const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const Recipe = require("../models/recipeModel");

// Get all comments for a specific recipe
const mongoose = require("mongoose");

exports.getAllComments = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await Comment.find({
      recipe: recipeId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
};

// Admin adds a comment to a recipe
exports.adminAddComment = async (req, res) => {
  try {
    const { adminId, recipeId } = req.params;
    const { content } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newComment = new Comment({
      content,
      user: userId,
      recipe: recipeId,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Admin edits a comment
exports.adminEditComment = async (req, res) => {
  try {
    const { adminId, recipeId, commentId } = req.params;
    const { content } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.isDeleted) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

// User edits a comment
exports.userEditComment = async (req, res) => {
  try {
    const { userId, commentId } = req.params;
    const { content } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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

// Admin deletes a comment (soft delete)
exports.adminDeleteComment = async (req, res) => {
  try {
    const { adminId, commentId } = req.params;

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

// User deletes a comment (soft delete)
exports.userDeleteComment = async (req, res) => {
  try {
    const { userId, commentId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
