const SavedRecipe = require('../models/savedRecipeModel');
const AppError = require('../utils/appError');
const { v4: uuidv4 } = require('uuid');

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

exports.saveRecipeToFavoriteList = async (req, res, next) => {
  try {
    const recipeId = req.recipe;
    if (!recipeId) {
      return next(new AppError('No recipeId found', 404));
    }

    // const { userId } = req.user.id;
    const { saverId, notes } = req.body;
    if (!saverId) {
      return next(new AppError('User not authenticated', 401));
    }

    // Kiểm tra xem công thức đã được lưu chưa
    const existingSavedRecipe = await SavedRecipe.findOne({
      recipe: recipeId,
      saver: saverId,
    });

    if (existingSavedRecipe) {
      return next(new AppError('Recipe already saved by this user', 400));
    }

    // Tạo một SavedRecipe mới
    const newSavedRecipe = await SavedRecipe.create({
      recipe: recipeId,
      saver: saverId,
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

exports.getAllSavedRecipes = async (req, res, next) => {
  try {
    const results = await SavedRecipe.find({
      isDeleted: false,
    });

    if (results.length === 0) {
      return next(new AppError('No saved recipes found', 404));
    }
    res.status(200).json(results);
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
    const savedRecipe = await SavedRecipe.findById(savedRecipeId, {
      isDeleted: false,
    })
      .populate({
        path: 'recipe', // Populate trường recipe
        select: 'owner', // Chỉ lấy trường owner của Recipe
        populate: {
          path: 'owner', // Populate trường owner của Recipe
          model: 'User', // Tham chiếu đến model User
          select: 'username avatar', // Chỉ lấy username và avatar của User
        },
      })
      .populate('saver', 'username avatar'); // Populate trường saver (người lưu)

    // Kiểm tra xem savedRecipe có tồn tại không
    if (!savedRecipe) {
      return next(new AppError('No saved recipe found', 404));
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
            owner: savedRecipe.recipe.owner, // Thông tin author từ Recipe
          },
          saver: savedRecipe.saver, // Thông tin người lưu
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
