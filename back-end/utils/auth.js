const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received Token:', token);
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = await User.findById(decoded.userId).select('role'); // Gán role vào req.user
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: error.message });
  }
};
