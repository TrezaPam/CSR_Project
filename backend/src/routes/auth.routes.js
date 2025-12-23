const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");

// URL Endpoint: POST /api/auth/register
router.post("/register", authController.register);

// URL Endpoint: POST /api/auth/login
router.post("/login", authController.login);

module.exports = router;
