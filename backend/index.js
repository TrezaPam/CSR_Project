const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./src/config/database");
const picRoutes = require("./src/routes/pic.routes");
const proposalRoutes = require("./src/routes/proposal.routes");
const authRoutes = require("./src/routes/auth.routes");
const routineRoutes = require("./src/routes/routine.routes");

const app = express();
const port = 5000;

// ==========================================================
// MIDDLEWARE
// ==========================================================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Test koneksi database
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi ke database berhasil.");
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error);
  }
};
testDbConnection();

// Route dasar
app.get("/", (req, res) => {
  res.send("Halo, ini adalah server backend CSR!");
});

// ==========================================================
// ROUTES
// ==========================================================
app.use("/api/pic", picRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/routines", routineRoutes);

// Menjalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
