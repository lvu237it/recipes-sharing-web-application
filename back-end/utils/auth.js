const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    // Token được gửi trong header Authorization theo định dạng: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Giải mã và lấy thông tin liên quan tới người dùng trong token
    req.user = await User.findById(decoded.userId).select('role'); // Tìm user với role cụ thể để gán vào req.user, phục vụ cho việc phân quyền
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: error.message });
  }
};
