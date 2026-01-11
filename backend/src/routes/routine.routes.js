const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routine.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Konfigurasi upload file (bukti pengiriman) ke folder khusus
const proofDir = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "uploads",
  "proofs"
);
if (!fs.existsSync(proofDir)) {
  fs.mkdirSync(proofDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proofDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "proof-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ==========================================
// STAKEHOLDER ROUTES
// ==========================================
router.get("/stakeholders", routineController.getAllStakeholders);
router.post("/stakeholders", routineController.createStakeholder);
router.put("/stakeholders/:id", routineController.updateStakeholder);
router.delete("/stakeholders/:id", routineController.deleteStakeholder);

// ==========================================
// ROUTINE SCHEDULE ROUTES
// ==========================================
router.get("/schedules", routineController.getAllRoutines);
router.get(
  "/schedules/by-stakeholder",
  routineController.getRoutinesByStakeholder
);
router.post(
  "/schedules",
  upload.single("proof_file"),
  routineController.createRoutine
);
router.post("/schedules/generate", routineController.generateMonthlySchedules);
router.put(
  "/schedules/:id",
  upload.single("proof_file"),
  routineController.updateRoutine
);
router.delete("/schedules/:id", routineController.deleteRoutine);

module.exports = router;
