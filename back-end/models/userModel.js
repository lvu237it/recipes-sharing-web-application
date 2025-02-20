const mongoose = require('mongoose');

//Tạo model cho user dựa trên các phương thức có sẵn của mongoose
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'User needs an user name'],
  },
  email: {
    type: String,
    required: [true, 'User needs an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'User needs a password'],
  },
  description: {
    type: String,
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
