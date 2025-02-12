const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  //--------mon xao---------
  imageUrl: {
    type: String,
  },
  foodCategories: {
    type: [String], // vi du: [mon xao, mon luoc] => phuc vu cho muc dich filter
    enum: [
      'món xào',
      'món luộc',
      'món nướng',
      'món chiên',
      'món canh',
      'món nộm',
      'món gỏi',
      'món lẩu',
      'món nước',
      'món chính',
      'món ăn nhẹ',
      'món nhậu',
      'món hấp',
      'món trộn',
      'món chay',
      'món bánh',
      'món kho',
      'món cháo',
      'món ăn vặt',
      'món cuốn',
      'món dịp đặc biệt',
      'món giò',
      'món khai vị',
      'món salad',
      'món hầm',
      'món súp',
    ],
    required: [true, 'A post needs a category!'],
  },
  title: {
    type: String,
    required: [true, 'A post needs a title!'],
  },
  description: {
    type: String,
    required: [true, 'A post needs a description!'],
  },
  ingredients: {
    type: [String],
    required: [true, 'A post needs ingredients!'],
  },
  steps: {
    type: [
      {
        stepNumber: Number,
        description: {
          type: String,
          required: [true, 'A step needs description!'],
        },
        imageOfStep: {
          type: [String],
        },
      },
    ],
    required: [true, 'A post needs steps!'],
  },
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User', //Tham chiếu tới collection User
    required: true,
  },
  sources: {
    type: [String],
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

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
