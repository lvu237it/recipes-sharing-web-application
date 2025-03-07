const mongoose = require('mongoose');
const slugify = require('slugify');
const recipeSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
  },
  foodCategories: {
    type: [String],
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
  status: {
    type: String,
    enum: ['Public', 'Private', 'Pending_Approval', 'Rejected'],
    default: 'Pending_Approval',
  },
  title: {
    type: String,
    required: [true, 'A post needs a title!'],
  },
  slug: {
    type: String,
    unique: true,
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
    ref: 'User',
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

/* 
-Pre Hooks: Chạy trước khi một hành động được thực hiện.
  +ví dụ như lưu (save), validate, hoặc xóa (remove) một tài liệu.
  +Bạn có thể sử dụng pre hooks để thực hiện các hành động như kiểm tra dữ liệu, mã hóa mật khẩu, hoặc thay đổi giá trị của các trường trước khi lưu vào cơ sở dữ liệu.

-Post Hooks: Chạy sau khi một hành động được thực hiện.
  +Post hooks chạy sau một hành động cụ thể, ví dụ như sau khi lưu (save), tìm kiếm (find), hoặc xóa (remove) một tài liệu.
  +Bạn có thể sử dụng post hooks để thực hiện các hành động như gửi email thông báo, ghi log, hoặc thay đổi dữ liệu sau khi nó đã được lưu vào cơ sở dữ liệu.
*/

//DOCUMENT MIDDLEWARE: runs before .save() .create()...
//----------NOTE!--------------------------------------
/*
Phần mềm trung gian tài liệu CHỈ CHẠY ĐỂ LƯU (save) VÀ TẠO (create) TÀI LIỆU CHỨ KHÔNG CHẠY ĐỂ CẬP NHẬT (update)
*/
recipeSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next(); // Chỉ tạo slug nếu 'title' thay đổi

  // Tạo slug cơ bản từ title
  let potentialSlug = slugify(this.title, {
    lower: true,
    remove: /[*+~.()'"!:@,]/g, // Loại bỏ dấu phẩy và ký tự đặc biệt
  });

  // Kiểm tra slug đã tồn tại trong cơ sở dữ liệu
  let slugExists = await mongoose.models.Recipe.findOne({
    slug: potentialSlug,
  });

  // Nếu tồn tại, thêm hậu tố vào slug cho đến khi không trùng lặp
  let count = 1;
  while (slugExists) {
    potentialSlug = `${slugify(this.title, {
      lower: true,
      remove: /[*+~.()'"!:@,]/g,
    })}-${count}`;
    slugExists = await mongoose.models.Recipe.findOne({ slug: potentialSlug });
    count++;
  }

  // Gán slug không trùng lặp
  this.slug = potentialSlug;
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
