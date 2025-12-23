const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Fungsi untuk Registrasi Pengguna Baru
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Cek apakah username sudah ada
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Buat pengguna baru (password akan otomatis di-hash oleh hook di model)
    const newUser = await User.create({ username, password, role });

    // Jangan kirim password kembali ke client
    const userResult = newUser.toJSON();
    delete userResult.password;

    res.status(201).json({
      message: "Registrasi berhasil",
      user: userResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Fungsi untuk Login Pengguna
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari pengguna berdasarkan username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // Bandingkan password yang diinput dengan password di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // Buat "tiket" (JWT Token)
    // Ganti 'SECRET_KEY' dengan string rahasia Anda sendiri, simpan di .env di proyek nyata
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "YOUR_SECRET_KEY",
      { expiresIn: "1h" } // Token akan hangus dalam 1 jam
    );

    // Jangan kirim password kembali ke client
    const userResult = user.toJSON();
    delete userResult.password;

    res.status(200).json({
      message: "Login berhasil",
      token: token,
      user: userResult,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
