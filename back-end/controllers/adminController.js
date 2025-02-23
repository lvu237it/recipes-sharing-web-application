//Không cần viết thêm adminModel mà sử dụng trực tiếp userModel với role là admin - kiểm tra role của user có phải admin không, và thực hiện tác vụ cần thiết
const User = require('../models/userModel');
const Recipe = require('../models/recipeModel');


//get all recipes for admin role
exports.getAllRecipe = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ status: 'error', message: 'Access denied. Admins only!' });
    }

    const { page = 1, limit = 10 } = req.query;

    const recipes = await Recipe.find({})
      .select('title foodCategories description createdAt owner')
      .populate('owner', 'username email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecipes = await Recipe.countDocuments();

    res.status(200).json({
      status: 'success',
      results: recipes.length,
      totalRecipes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecipes / limit),
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


//get recipe details admin role
exports.getRecipeDetails = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ status: 'error', message: 'Access denied. Admins only!' });
    }

    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId)
      .select('title foodCategories description createdAt owner')
      .populate('owner', 'username email');

    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    res.status(200).json({
      status: 'success',
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// approve/reject recipe post
exports.updateRecipeStatus = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ status: 'error', message: 'Access denied. Admins only!' });
    }

    const { recipeId } = req.params;
    const { status } = req.body; // Nhận trạng thái từ body (approved / rejected)

    if (!['Public', 'Rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ status: 'error', message: 'Recipe not found' });
    }

    // Cập nhật trạng thái
    recipe.status = status;
    await recipe.save();

    res.status(200).json({
      status: 'success',
      message: `Recipe ${status} successfully`,
      data: recipe,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
