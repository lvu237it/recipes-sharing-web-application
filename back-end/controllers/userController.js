const User = require('../models/userModel');
//Code demo
// exports.createAnUser = async (req, res) => {
//   try {
//     const { username, role } = req.body;
//     await User.create({ username, role });

//     res.json({
//       status: 'success',
//     });
//   } catch (error) {
//     console.log('error while creating an user');
//   }
// };

//Get User in4 by userID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await User.findById(userId);

    return res.json({
      message: 'success',
      status: 200,
      data: results,
    });
  } catch (error) {
    console.log('error while getting users by id', error);
    return res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Get all recipes of an user
const mongoose = require('mongoose');
const Recipe = require('../models/recipeModel'); 

exports.findAllRecipesByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL

    // Kiểm tra xem userId có đúng định dạng ObjectId không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: 'Invalid User ID format.',
      });
    }

    // Truy vấn danh sách công thức theo owner (userId)
    const recipes = await Recipe.find({ owner: userId });

    if (recipes.length > 0) {
      return res.status(200).json({
        message: 'success',
        data: recipes,
      });
    }

    return res.status(404).json({
      message: 'No recipes found for this user.',
      status: 404,
    });
  } catch (error) {
    console.error('Error while getting recipes by user ID:', error);
    return res.status(500).json({
      message: 'Server error',
      status: 500,
      error: error.message,
    });
  }
};

//Update in4 user
exports.updateUser = async (req, res) => {
  try {
    // Lấy tham số từ body của request từ client và đem xử lý tại server
    const {
      username,
      email,
      password,
      description,
    } = req.body;
    const { userId } = req.params;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 404,
      });
    }

    // Nếu tồn tại, tiếp tục cập nhật
    const updateData = {
      username,
      email,
      password,
      description,
      updatedAt: Date.now(),
    };

    // Cập nhật món ăn với các trường có dữ liệu
    const recentUpdated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Trả về kết quả hiển thị dưới dạng json
    return res.status(200).json({
      message: 'Update successful',
      status: 200,
      data: recentUpdated,
    });
  } catch (error) {
    console.log('Error while updating recipe:', error);
    return res.status(404).json({
      message: 'error',
      status: 404,
      error,
    });
  }
};





