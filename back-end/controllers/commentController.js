const Comment = require('../models/commentModel');
const {
  isValidObjectId,
  isValidUser,
  isValidRecipe,
  isValidComment,
  isCommentMadeByUser,
} = require('./utils');

// Helper to check if the logged-in user is an admin.
const checkIsAdmin = (req) => {
  return req.user && req.user.role === 'admin';
};

// Get all comments for a specific recipe
exports.getAllComments = async (req, res) => {
  try {
    const { recipeId } = req.params;
    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID.' });
    }
    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: 'Recipe does not exist.' });
    }
    const comments = await Comment.find({ recipe: recipeId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
};

exports.getAllCommentsForAdmin = async (req, res) => {
  try {
    const { recipeId } = req.params;
    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID.' });
    }
    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: 'Recipe does not exist.' });
    }
    const comments = await Comment.find({ recipe: recipeId });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
};

// Admin adds a comment using req.user from token header
exports.adminAddComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;

    if (!checkIsAdmin(req)) {
      return res
        .status(403)
        .json({ error: 'Unauthorised: User is not an admin.' });
    }
    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID.' });
    }
    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: 'Comment content cannot be empty.' });
    }
    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: 'Recipe does not exist.' });
    }

    const newComment = new Comment({
      content,
      user: req.user._id,
      recipe: recipeId,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
};

// User adds a comment using req.user from token header
exports.userAddComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID.' });
    }
    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: 'Comment content cannot be empty.' });
    }
    if (!(await isValidUser(req.user._id))) {
      return res.status(404).json({ error: 'User does not exist.' });
    }
    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: 'Recipe does not exist.' });
    }

    const newComment = new Comment({
      content,
      user: req.user._id,
      recipe: recipeId,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
};

// Admin edits a comment
exports.adminEditComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: 'Invalid recipe or comment ID.' });
    }
    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: 'Comment content cannot be empty.' });
    }
    if (!checkIsAdmin(req)) {
      return res
        .status(403)
        .json({ error: 'Unauthorised: User is not an admin.' });
    }
    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: 'Comment does not exist.' });
    }
    if (!(await isCommentMadeByUser(commentId, req.user._id))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: Cannot edit others' comments." });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment.' });
  }
};

// User edits their own comment
exports.userEditComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: 'Invalid recipe or comment ID.' });
    }
    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: 'Comment content cannot be empty.' });
    }
    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: 'Comment does not exist.' });
    }
    if (!(await isCommentMadeByUser(commentId, req.user._id))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: Cannot edit others' comments." });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment.' });
  }
};

// Admin deletes a comment
exports.adminDeleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: 'Invalid recipe or comment ID.' });
    }
    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: 'Comment does not exist.' });
    }
    if (!checkIsAdmin(req)) {
      return res
        .status(403)
        .json({ error: 'Unauthorised: User is not an admin.' });
    }
    const deletedComment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};

// User deletes their own comment
exports.userDeleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: 'Invalid recipe or comment ID.' });
    }
    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: 'Comment does not exist.' });
    }
    if (!(await isCommentMadeByUser(commentId, req.user._id))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: Cannot delete others' comments." });
    }
    const deletedComment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};
