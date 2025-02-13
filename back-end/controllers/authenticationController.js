// exports.functionToSolveSomething

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

exports.registerUser = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    const { username, email, password } = req.body;

    // Kiểm tra xem có thiếu trường nào không
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Missing required fields',
        status: 400,
      });
    }

    // Kiểm tra xem email đã tồn tại trong DB chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already exists',
        status: 409,
      });
    }

    // Băm (hash) mật khẩu trước khi lưu vào database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Trả về kết quả
    res.status(201).json({
      message: 'User registered successfully',
      status: 201,
      data: newUser,
    });
  } catch (error) {
    console.error('Error while registering user:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      status: 500,
      error,
    });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem có nhập đủ thông tin không
    if (!email || !password) {
      return res.status(400).json({
        message: 'Missing email or password',
        status: 400,
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email ',
        status: 401,
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid password',
        status: 401,
      });
    }
    // Tạo JWT Token có hạn 2h
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: '7200s' }
    );

    // Trả về token + thông tin user (không gửi password)
    res.status(200).json({
      message: 'Login successful',
      status: 200,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error while logging in:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      status: 500,
      error,
    });
  }
};
