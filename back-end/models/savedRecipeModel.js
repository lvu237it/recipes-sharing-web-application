const mongoose = require('mongoose');
const SavedRecipeSchema = new mongoose.Schema({
  notes: String, //take notes something about saved recipe
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
  recipe: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Recipe',
    required: true,
  },
  saver: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  // Bỏ author vì sẽ duplicate dữ liệu - thay vào đó là sử dụng tham chiếu tới Recipe đã có, để lấy ra owner của recipe
  // author: {
  //   type: mongoose.SchemaTypes.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
});

// Virtual populate - tạo ra kết nối ảo - virtual connection giữa các collection
// Nó không lưu trực tiếp dữ liệu vào document, mà chỉ tham chiếu đến dữ liệu từ collection khác.
// Khi gọi .populate(), Mongoose sẽ thực hiện các truy vấn cần thiết để "join" dữ liệu từ các collection lại với nhau.

// Thêm virtual field để lấy thông tin author từ Recipe → User
SavedRecipeSchema.virtual('authorInfo', {
  // truy cập trực tiếp thông tin author thông qua một trường ảo (authorInfo).

  ref: 'Recipe', // Tham chiếu đến model Recipe
  localField: 'recipe', // Trường trong SavedRecipe dùng để join (ở đây là recipe).
  foreignField: '_id', // Trường trong Recipe dùng để join (ở đây là _id).
  justOne: true, // Chỉ lấy một document (vì mỗi SavedRecipe chỉ tham chiếu đến một Recipe).
}).get((value) => value?.owner);
// get((value) => value?.owner): Khi truy cập authorInfo, nó sẽ trả về giá trị của owner từ Recipe.

// ví dụ
/*  
    const savedRecipe = await SavedRecipe.findOne().populate('authorInfo');
    console.log(savedRecipe.authorInfo); // Trả về thông tin owner của Recipe
*/

const SavedRecipe = mongoose.model('SavedRecipe', SavedRecipeSchema);
module.exports = SavedRecipe;
