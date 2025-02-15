const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
//Router for business logic here
//default: /admin
router.get('/', handler);

module.exports = router;
