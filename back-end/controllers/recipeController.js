const Recipe = require('../models/recipeModel');

exports.getAllRecipes = async (req, res) => {
  try {
    const results = await Recipe.find({});
    res.json({
      message: 'success',
      status: 200,
      data: results,
    });
  } catch (error) {
    console.log('error while getting recipes');
  }
};

exports.createNewRecipe = async (req, res) => {
  try {
    //Lấy tham số từ body của request từ client và đem xử lý tại server
    const { foodCategories, title, ingredients, steps, owner } = req.body;

    const recentRecipeCreated = await Recipe.create({
      foodCategories,
      title,
      ingredients,
      steps,
      owner,
    });

    //Trả về kết quả hiển thị dưới dạng json
    res.json({
      message: 'success',
      status: 200,
      data: recentRecipeCreated,
    });
  } catch (error) {
    console.log('error while creating recipe');
  }
};
