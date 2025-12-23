// src/controllers/pic.controller.js
const PIC = require("../models/pic.model");

// Fungsi untuk mendapatkan semua data PIC
exports.getAllPIC = async (req, res) => {
  try {
    const allPIC = await PIC.findAll();
    res.status(200).json(allPIC);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk membuat PIC baru
exports.createPIC = async (req, res) => {
  try {
    const newPIC = await PIC.create(req.body);
    res.status(201).json(newPIC);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
