const SavedRecipe = require('../models/savedRecipeModel');
const AppError = require('../utils/appError');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');

exports.checkIfSavedRecipeIsExist = async (req, res, next) => {
  try {
    const { savedRecipeId } = req.params;
    if (!savedRecipeId) {
      return next(new AppError('No savedRecipeId found', 404));
    }
    const savedRecipeById = SavedRecipe.find(savedRecipeId);
    if (!savedRecipeById) {
      return next(new AppError('No saved recipes found', 404));
    }
    req.savedRecipeId = savedRecipeId;
    next();
  } catch (error) {
    console.error('Error finding saved recipe', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get saved recipe by id.',
    });
  }
};

//ok
exports.saveRecipeToFavoriteList = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      return next(new AppError('No recipeId found', 404));
    }

    // Lấy userId từ req.user thay vì req.body
    const userId = req.user._id;
    const { notes, saverId } = req.body;

    // Kiểm tra xem công thức đã được lưu chưa
    const existingSavedRecipe = await SavedRecipe.findOne({
      recipe: recipeId,
      saver: userId || saverId,
      isDeleted: false,
    });

    if (existingSavedRecipe) {
      return next(new AppError('Recipe already saved by this user', 400));
    }

    // Tạo một SavedRecipe mới
    const newSavedRecipe = await SavedRecipe.create({
      recipe: recipeId,
      saver: userId || saverId,
      notes: notes || null,
    });

    // Trả về kết quả hiển thị dưới dạng json
    return res.status(201).json({
      status: 'success',
      data: newSavedRecipe,
    });
  } catch (error) {
    console.error('Error creating saved recipe', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create saved recipe.',
    });
  }
};

//ok
exports.unsaveRecipeFromFavoriteList = async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id;

    if (!recipeId) {
      return next(new AppError('Missing recipeId', 400));
    }

    // Thực hiện hard delete
    const deleteResult = await SavedRecipe.deleteOne({
      recipe: recipeId,
      saver: userId,
    });

    if (deleteResult.deletedCount === 0) {
      return next(new AppError('Recipe not found in your favorite list', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Recipe removed from favorites successfully!',
    });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsave recipe.',
    });
  }
};

exports.checkARecipeIsSaved = async (req, res, next) => {
  try {
    const { recipeId, saverId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!recipeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing recipeId parameter',
      });
    }

    // Kiểm tra trong database
    const savedRecipe = await SavedRecipe.findOne({
      recipe: recipeId,
      saver: userId || saverId,
      isDeleted: false,
    });

    res.status(200).json({
      status: 'success',
      isSaved: !!savedRecipe,
      data: {
        exists: !!savedRecipe,
      },
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check recipe saved status.',
    });
  }
};

exports.getAllSavedRecipes = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Please login to view saved recipes.',
      });
    }

    // Build query based on user role
    const query = {
      isDeleted: false,
    };

    // If user is not admin, only show their own saved recipes
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const results = await SavedRecipe.find(query);

    if (results.length === 0) {
      return next(new AppError('No saved recipes found', 404));
    }

    // Add role information to response
    res.status(200).json({
      status: 'success',
      role: req.user.role,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching saved recipes', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get saved recipes.',
    });
  }
};

exports.getSavedRecipesBySaverId = async (req, res, next) => {
  try {
    const { saverId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Please login to view saved recipes.',
      });
    }

    // If user is not admin, they can only view their own saved recipes
    if (req.user.role !== 'admin' && req.user._id.toString() !== saverId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own saved recipes.',
      });
    }

    let results = await SavedRecipe.find({ saver: saverId })
      .populate('recipe')
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày mới nhất trước

    // Lọc các recipe không bị xóa (isDeleted = false)
    results = results.filter(
      (savedRecipe) =>
        savedRecipe.recipe &&
        !savedRecipe.recipe.isDeleted &&
        savedRecipe.recipe.status === 'Public'
    );

    if (results.length === 0) {
      return next(new AppError('No saved recipes found for this user', 404));
    }

    res.status(200).json({
      status: 'success',
      role: req.user.role,
      data: results,
    });
  } catch (error) {
    console.error('Error getting saved recipes by saver id', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get saved recipes by saver id.',
    });
  }
};

exports.getAllSavedRecipes = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Please login to view saved recipes.',
      });
    }

    // Build query based on user role
    const query = {
      isDeleted: false,
    };

    // If user is not admin, only show their own saved recipes
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const results = await SavedRecipe.find(query);

    if (results.length === 0) {
      return next(new AppError('No saved recipes found', 404));
    }

    // Add role information to response
    res.status(200).json({
      status: 'success',
      role: req.user.role,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching saved recipes', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get saved recipes.',
    });
  }
};

exports.getInformationOfSavedRecipe = async (req, res, next) => {
  try {
    const savedRecipeId = req.savedRecipeId;

    // Sử dụng populate để join dữ liệu từ Recipe và User
    const savedRecipe = await SavedRecipe.findOne({
      _id: savedRecipeId,
      isDeleted: false,
    })
      .populate({
        path: 'recipe',
        select: 'owner',
        populate: {
          path: 'owner',
          model: 'User',
          select: 'username avatar',
        },
      })
      .populate('saver', 'username avatar');

    // Kiểm tra xem savedRecipe có tồn tại không
    if (!savedRecipe) {
      return next(new AppError('No saved recipe found', 404));
    }

    // Kiểm tra quyền truy cập
    if (
      req.user.role !== 'admin' &&
      savedRecipe.saver._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own saved recipes.',
      });
    }

    // Trả về kết quả
    res.status(200).json({
      status: 'success',
      data: {
        savedRecipe: {
          _id: savedRecipe._id,
          notes: savedRecipe.notes,
          createdAt: savedRecipe.createdAt,
          recipe: {
            _id: savedRecipe.recipe._id,
            owner: savedRecipe.recipe.owner,
          },
          saver: savedRecipe.saver,
        },
      },
    });
  } catch (error) {
    console.error('Error getting information of saved recipe', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get information of saved recipes.',
    });
  }
};
