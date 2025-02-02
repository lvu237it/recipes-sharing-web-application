const Recipe = require('../models/recipeModel');

exports.getAllRecipes = async (req, res) => {
  try {
    const results = await Recipe.find({});

    // Thay thế ký tự \n bằng thẻ <div>
    const updatedResults = results.map((recipe) => ({
      ...recipe._doc,
      description: recipe.description
        .replace(/'/g, '"')
        .split('\n')
        .map((line) => `<div>${line}</div>`)
        .join(''),
    }));

    res.json({
      message: 'success',
      status: 200,
      data: updatedResults,
    });
  } catch (error) {
    console.log('error while getting recipes', error);
    res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

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
    res.json({
      message: 'success',
      status: 200,
      data: recentRecipeCreated,
    });
  } catch (error) {
    console.log('error while creating recipe', error);
    res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

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
    const existingRecipe = await Recipe.findById(recipeId);

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
    res.json({
      message: 'Update successful',
      status: 200,
      data: recentUpdated,
    });
  } catch (error) {
    console.log('Error while updating recipe:', error);
    res.json({
      message: 'error',
      status: 404,
      error,
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    // Lấy tham số từ request
    const { recipeId } = req.params;

    // Kiểm tra sự tồn tại của recipeId trong cơ sở dữ liệu
    const existingRecipe = await Recipe.findById(recipeId);

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
    res.json({
      message: 'Delete successful',
      status: 200,
      data: recentDeleted,
    });
  } catch (error) {
    console.log('Error while deleting recipe:', error);
    res.status(500).json({
      message: 'Server error',
      status: 500,
    });
  }
};
