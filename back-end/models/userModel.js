const mongoose = require("mongoose");

//Tạo model cho user dựa trên các phương thức có sẵn của mongoose
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "User needs an user name"],
  },
  email: {
    type: String,
    required: [true, "User needs an email"],
  },
  password: {
    type: String,
    required: [true, "User needs a password"],
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  avatar: String,
  followers: {
    type: [
      //mảng chứa các objectId của những người followers
      mongoose.SchemaTypes.ObjectId,
    ],
    ref: "User", //Tham chiếu tới collection User
  },
  listOfPosts: {
    type: [
      //mảng chứa các objectId của những bài đăng về công thức nấu ăn
      mongoose.SchemaTypes.ObjectId,
    ],
    ref: "Recipe", //Tham chiếu tới collection Recipe
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

const User = mongoose.model("User", userSchema);

module.exports = User;
