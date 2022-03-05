const express = require("express");
const authController = require("../../../controllers/api/v2/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
