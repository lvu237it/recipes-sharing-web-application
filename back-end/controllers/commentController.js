const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const {
  isValidObjectId,
  isValidUser,
  isAdmin,
  isValidRecipe,
  isValidComment,
  isCommentMadeByUser,
} = require("./utils");

// Get all comments for a specific recipe
exports.getAllComments = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    const comments = await Comment.find({ recipe: recipeId, isDeleted: false });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve comments." });
  }
};

// Admin adds a comment to a recipe
exports.adminAddComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;

    // Verify that the logged-in user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
    }

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    // Use logged-in admin data from req.user
    const adminUser = req.user;

    const newComment = new Comment({
      content,
      user: adminUser._id,
      recipe: recipeId,
      authorUsername: adminUser.username,
      authorAvatar: adminUser.avatar,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment." });
  }
};

// User adds a comment to a recipe
exports.userAddComment = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    // Verify logged-in user exists (protect middleware already does this)
    const userId = req.user._id;
    if (!(await isValidUser(userId))) {
      return res.status(404).json({ error: "User does not exist." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    // Use the logged-in user's data from req.user
    const user = req.user;
    const newComment = new Comment({
      content,
      user: user._id,
      recipe: recipeId,
      authorUsername: user.username,
      authorAvatar: user.avatar,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment." });
  }
};

// Admin edits a comment
exports.adminEditComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { content } = req.body;

    // Verify that the logged-in user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
    }

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid recipe or comment ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    // (Optional) Check if the comment was originally made by this admin.
    // Remove this check if you want admins to edit any comment.
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
    res.status(500).json({ error: "Failed to update comment." });
  }
};

// User edits their own comment
exports.userEditComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid recipe or comment ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    // Ensure that the comment belongs to the logged-in user
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
    res.status(500).json({ error: "Failed to update comment." });
  }
};

// Admin deletes any comment
exports.adminDeleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;

    // Verify that the logged-in user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
    }

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid recipe or comment ID." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    const deletedComment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(deletedComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment." });
  }
};

// User deletes their own comment
exports.userDeleteComment = async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;

    if (!isValidObjectId(recipeId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid recipe or comment ID." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    // Ensure that the comment was made by the logged-in user
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
    res.status(500).json({ error: "Failed to delete comment." });
  }
};
