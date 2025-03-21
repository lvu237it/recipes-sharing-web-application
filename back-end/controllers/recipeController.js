const Recipe = require('../models/recipeModel');
const AppError = require('../utils/appError');
const ObjectId = require('mongodb');

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const { limit = 10, cursor = 0, category, sortOrder } = req.query;
    const query = { isDeleted: false };

    // Add category filter if specified
    if (category) {
      query.foodCategories = category;
    }

    // Get total count before pagination
    const totalRecipes = await Recipe.countDocuments(query);
    const totalPages = Math.ceil(totalRecipes / limit);

    // Create sort object
    let sortObj = {};
    if (sortOrder === 'latest') {
      sortObj = { createdAt: -1 };
    } else if (sortOrder === 'oldest') {
      sortObj = { createdAt: 1 };
    }

    const results = await Recipe.find({ ...query, status: 'Public' })
      .sort(sortObj)
      .skip(parseInt(cursor))
      .limit(parseInt(limit))
      .exec();

    // Format description
    const updatedResults = results.map((recipe) => ({
      ...recipe._doc,
      description: recipe.description
        .replace(/'/g, '"')
        .split('\n')
        .map((line) => `<div>${line}</div>`)
        .join(''),
    }));

    return res.json({
      message: 'success',
      status: 200,
      totalRecipes,
      totalPages,
      data: updatedResults,
    });
  } catch (error) {
    console.log('error while getting recipes', error);
    return res.status(500).json({
      message: 'error',
      status: 500,
      error: error.message,
    });
  }
};

// Get recipe by recipe id
exports.getRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const results = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
      status: 'Public',
    });

    return res.json({
      message: 'success',
      status: 200,
      data: results,
    });
  } catch (error) {
    console.log('error while getting recipes by id', error);
    return res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Get populated recipe by recipe id
exports.getPopulateRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const results = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
      status: 'Public',
    }).populate('owner', 'username avatar');

    return res.json({
      message: 'success',
      status: 200,
      data: results,
    });
  } catch (error) {
    console.log('error while getting populated recipes by id', error);
    return res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

//Check if recipe is exist or not
exports.checkIfRecipeIsExist = async (req, res, next) => {
  const { recipeId } = req.params;
  const { recipe_id } = req.body;

  // Kiểm tra xem recipeId hoặc recipe_id có tồn tại không
  if (recipeId) {
    const result = await Recipe.findById(recipeId);

    if (!result) {
      return next(new AppError('No recipe found', 404));
    }

    req.recipe = recipeId;
    next();
  } else if (recipe_id) {
    const result = await Recipe.findById(recipe_id);

    // Kiểm tra xem result có tồn tại không
    if (!result) {
      return next(new AppError('No recipe found', 404));
    }

    req.recipe = recipe_id;
    next();
  } else {
    return next(new AppError('No recipe found', 404));
  }
};

/*
--------------------Xử lý tìm kiếm dữ liệu nhập vào là kiểu mảng-------------------------
Tìm món ăn có chứa ít nhất một loại trong danh sách (OR logic) → Dùng $in.
Tìm món ăn chứa tất cả các loại bạn truyền vào (AND logic) → Dùng $all.
Tìm món ăn có chính xác các loại bạn truyền vào, không hơn không kém → Dùng $size kết hợp với $all.
*/
//Get recipes by categories
exports.findAllRecipesByCategories = async (req, res) => {
  try {
    const { foodCategories } = req.body;
    if (!foodCategories || !Array.isArray(foodCategories)) {
      return res
        .status(400)
        .json({ message: 'foodCategories must be an array.' });
    }

    const results = await Recipe.find({
      foodCategories: { $all: foodCategories },
      isDeleted: false,
    });

    if (results.length > 0) {
      return res.status(200).json({
        message: 'success',
        status: 200,
        data: results,
      });
    }
    res.status(404).json({
      message: 'recipes not found',
      status: 404,
    });
  } catch (error) {
    console.log('error while getting recipes by categories', error);
    return res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Get all recipes by title
exports.findAllRecipesByTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        message: 'Title must be a non-empty string.',
      });
    }

    const results = await Recipe.find({
      title: { $regex: title, $options: 'i' }, // "i" để không phân biệt hoa/thường
      isDeleted: false,
    });

    if (results.length > 0) {
      return res.status(200).json({
        message: 'success',
        data: results,
      });
    }
    return res.status(404).json({
      message: 'recipes not found',
      status: 404,
    });
  } catch (error) {
    console.log('error while getting recipes by title', error);
    return res.status(404).json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Create new recipe
exports.createNewRecipe = async (req, res) => {
  try {
    const {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      owner,
      sources,
    } = req.body;

    const ownerId = req.user._id;

    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({
        message: `You need to login to create new recipe.`,
        status: 403,
      });
    }

    // Kiểm tra và parse nếu là chuỗi JSON
    const parseIfString = (value) => {
      try {
        return typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        return value; // Nếu không phải chuỗi JSON, trả về giá trị nguyên vẹn
      }
    };

    // Lưu recipe vào cơ sở dữ liệu
    const recentRecipeCreated = await Recipe.create({
      imageUrl, // Đã có URL ảnh từ frontend
      foodCategories: parseIfString(foodCategories),
      title,
      description,
      ingredients: parseIfString(ingredients),
      steps: parseIfString(steps),
      owner: parseIfString(ownerId) || parseIfString(owner),
      sources: parseIfString(sources),
    });

    // Trả về kết quả hiển thị dưới dạng json
    return res.status(200).json({
      message: 'success',
      status: 200,
      data: recentRecipeCreated,
    });
  } catch (error) {
    console.log('error while creating recipe', error);
    return res.status(404).json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Update recipe
exports.updateRecipe = async (req, res) => {
  try {
    // Lấy tham số từ body của request từ client và đem xử lý tại server
    const {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      sources,
      status,
    } = req.body;
    const { recipeId } = req.params;
    console.log('recipdid', recipeId);

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
      status: 'Public',
    });

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
      });
    }

    if (existingRecipe[0].owner === req.user._id) {
      return res.status(403).json({
        message: `You only can delete your own recipe.`,
        status: 403,
      });
    }

    // Nếu tồn tại, tiếp tục cập nhật
    const updateData = {
      imageUrl,
      foodCategories,
      title,
      description,
      ingredients,
      steps,
      status,
      sources,
      updatedAt: Date.now(),
    };

    // Cập nhật món ăn với các trường có dữ liệu
    const recentUpdated = await Recipe.findByIdAndUpdate(recipeId, updateData, {
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

// Delete a recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    console.log('recipeId', recipeId);

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
      status: 'Public',
    });

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
      });
    }

    if (existingRecipe[0].owner === req.user._id) {
      return res.status(403).json({
        message: `You only can delete your own recipe.`,
        status: 403,
      });
    }

    // Tiến hành đánh dấu món ăn là đã xóa
    const recentDeleted = await Recipe.findByIdAndUpdate(
      recipeId,
      { isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() },
      { new: true }
    );

    // Trả về kết quả hiển thị dưới dạng json
    return res.status(200).json({
      message: 'Delete successful',
      status: 200,
      data: recentDeleted,
    });
  } catch (error) {
    console.log('Error while deleting recipe:', error);
    return res.status(500).json({
      message: 'Server error',
      status: 500,
    });
  }
};

// Search recipes by title or ingredients
exports.searchRecipesByQuery = async (req, res) => {
  try {
    const {
      query = '',
      limit = 10,
      cursor = 0,
      category,
      sortOrder,
    } = req.query;

    if (!query.trim()) {
      return res.json({
        message: 'success',
        status: 200,
        data: [],
        totalPages: 0,
      });
    }

    // Create search query
    const searchQuery = {
      isDeleted: false,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { ingredients: { $elemMatch: { $regex: query, $options: 'i' } } },
      ],
    };

    // Add category filter if specified
    if (category) {
      searchQuery.foodCategories = category;
    }

    // Create sort object
    let sortObj = {};
    if (sortOrder === 'latest') {
      sortObj = { createdAt: -1 };
    } else if (sortOrder === 'oldest') {
      sortObj = { createdAt: 1 };
    }

    // Get total count for pagination
    const totalRecipes = await Recipe.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalRecipes / limit);

    // Get paginated results
    const results = await Recipe.find({ ...searchQuery, status: 'Public' })
      .sort(sortObj)
      .skip(parseInt(cursor))
      .limit(parseInt(limit))
      .exec();

    // Format description
    const updatedResults = results.map((recipe) => ({
      ...recipe._doc,
      description: recipe.description
        .replace(/'/g, '"')
        .split('\n')
        .map((line) => `<div>${line}</div>`)
        .join(''),
    }));

    return res.json({
      message: 'success',
      status: 200,
      totalRecipes,
      totalPages,
      data: updatedResults,
    });
  } catch (error) {
    console.log('error while searching recipes', error);
    return res.status(500).json({
      message: 'error',
      status: 500,
      error: error.message,
    });
  }
};
