// src/routes/pic.routes.js
const express = require("express");
const router = express.Router();
const picController = require("../controllers/pic.controller");

router.get("/", picController.getAllPIC);
router.post("/", picController.createPIC);

module.exports = router;
