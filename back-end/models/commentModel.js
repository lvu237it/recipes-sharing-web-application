const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "A comment needs content!"],
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  // Cached data to avoid querying the user every time we display a comment.
  authorUsername: {
    type: String, // Cache username
  },
  authorImageUrl: {
    type: String, // Cache image URL (from user's avatar)
  },
  recipe: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Recipe",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
