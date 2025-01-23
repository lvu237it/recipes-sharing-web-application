const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  //--------mon xao---------
  imageUrl: {
    type: String,
  },
  foodCategories: {
    type: [String], // vi du: [mon xao, mon luoc] => phuc vu cho muc dich filter
    enum: [
      'mon xao',
      'mon luoc',
      'mon nuong',
      'mon chien',
      'mon canh',
      'mon nom',
      'mon lau',
    ],
    required: [true, 'A post needs a category!'],
  },
  title: {
    type: String,
    required: [true, 'A post needs a title!'],
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
  // comments: [
  //   {
  //     user: {
  //       type: mongoose.SchemaTypes.ObjectId,
  //       ref: 'User', //Tham chiếu tới collection User
  //     },
  //     commentDescription: String,
  //   },
  // ],
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
