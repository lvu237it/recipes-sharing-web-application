const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A comment needs content!'],
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  // dữ liệu cache - mặc định thêm username và avatar để giảm thiểu số lần truy vấn lại tới user mỗi lần hiển thị comment mà cần hiển thị cả username và avatar
  authorUsername: {
    type: String, // Cache username
    // required: [true, 'Need cache data of authorUsername for this comment!'],
  },
  // dữ liệu cache - mặc định thêm username và avatar để giảm thiểu số lần truy vấn lại tới user mỗi lần hiển thị comment mà cần hiển thị cả username và avatar
  authorAvatar: {
    type: String, // Cache avatar URL
    // required: [true, 'Need cache data of authorAvatar for this comment!'],
  },
  recipe: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Recipe',
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

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
