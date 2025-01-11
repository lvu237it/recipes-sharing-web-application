const User = require('../models/userModel');

exports.createAnUser = async (req, res) => {
  try {
    const { username } = req.body;
    await User.create({ username });

    res.json({
      status: 'success',
    });
  } catch (error) {
    console.log('error while creating an user');
  }
};
