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
    const { adminId, recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(adminId) || !isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid admin or recipe ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    if (!(await isAdmin(adminId))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
    }

    // Retrieve the admin's user data for caching
    const adminUser = await User.findById(adminId);

    const newComment = new Comment({
      content,
      user: adminId,
      recipe: recipeId,
      authorUsername: adminUser.username,
      authorImageUrl: adminUser.avatar,
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
    const { userId, recipeId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid user or recipe ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidUser(userId))) {
      return res.status(404).json({ error: "User does not exist." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    // Retrieve the user's data for caching
    const user = await User.findById(userId);

    const newComment = new Comment({
      content,
      user: userId,
      recipe: recipeId,
      authorUsername: user.username,
      authorImageUrl: user.avatar,
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
    const { adminId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(adminId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid admin or comment ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isAdmin(adminId))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    if (!(await isCommentMadeByUser(commentId, adminId))) {
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
    const { userId, commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(userId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid user or comment ID." });
    }

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Comment content cannot be empty." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    if (!(await isCommentMadeByUser(commentId, userId))) {
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
    const { adminId, commentId } = req.params;

    if (!isValidObjectId(adminId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid admin or comment ID." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    if (!(await isAdmin(adminId))) {
      return res
        .status(403)
        .json({ error: "Unauthorised: User is not an admin." });
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
    const { userId, commentId } = req.params;

    if (!isValidObjectId(userId) || !isValidObjectId(commentId)) {
      return res.status(400).json({ error: "Invalid user or comment ID." });
    }

    if (!(await isValidComment(commentId))) {
      return res.status(404).json({ error: "Comment does not exist." });
    }

    if (!(await isCommentMadeByUser(commentId, userId))) {
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


exports.getAllCommentsForAdmin = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!isValidObjectId(recipeId)) {
      return res.status(400).json({ error: "Invalid recipe ID." });
    }

    if (!(await isValidRecipe(recipeId))) {
      return res.status(404).json({ error: "Recipe does not exist." });
    }

    const comments = await Comment.find({ recipe: recipeId}).populate('user', 'username');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve comments." });
  }
};