/*
Định nghĩa router xử lý từng request từ phía client gửi tới server
*/

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Gọi tới các module xử lý request từ controller
router.post("/create-new-user", userController.createAnUser);

module.exports = router;
