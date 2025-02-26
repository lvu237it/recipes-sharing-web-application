//Không cần viết thêm adminModel mà sử dụng trực tiếp userModel với role là admin - kiểm tra role của user có phải admin không, và thực hiện tác vụ cần thiết
const User = require("../models/userModel");
const Recipe = require("../models/recipeModel");

exports.getAllRecipe = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ status: "error", message: "Access denied. Admins only!" });
    }

    const { page = 1, limit = 10 } = req.query;

    const recipes = await Recipe.find({})
      .select("title foodCategories description createdAt owner")
      .populate("owner", "username email")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecipes = await Recipe.countDocuments();

    res.status(200).json({
      status: "success",
      results: recipes.length,
      totalRecipes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecipes / limit),
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// exports.functionToSolveSomething
