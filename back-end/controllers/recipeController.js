const Recipe = require('../models/recipeModel');
const AppError = require('../utils/appError');

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const { limit = 10, cursor = null } = req.query; // Thêm tham số limit và cursor
    const skip = cursor ? parseInt(cursor) : 0;

    const results = await Recipe.find({ isDeleted: false })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalRecipes = await Recipe.countDocuments({ isDeleted: false }); // Đếm tổng số công thức

    const totalPages = Math.ceil(totalRecipes / limit); // Tính tổng số trang

    // Trả về dữ liệu và nextCursor
    const nextCursor = results.length < limit ? null : skip + limit;

    return res.json({
      message: 'success',
      status: 200,
      data: results,
      totalPages,
      nextCursor,
    });
  } catch (error) {
    console.log('error while getting recipes', error);
    return res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

// Get recipe by recipe id
exports.getRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const results = await Recipe.find({ _id: recipeId, isDeleted: false });

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
      owner,
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
    } = req.body;
    const { recipeId } = req.params;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
    });

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
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
    const recipeId = req.recipe;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.find({
      _id: recipeId,
      isDeleted: false,
    });

    if (!existingRecipe) {
      return res.status(404).json({
        message: 'Recipe not found',
        status: 404,
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
