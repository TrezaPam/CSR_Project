// src/routes/proposal.routes.js (Enhanced and Fixed Version)

const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import models
const Proposal = require("../models/proposal.model");
const PIC = require("../models/pic.model");

// Konfigurasi Multer untuk file upload
// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Helper function untuk generate Case ID
const generateCaseId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CSR-${currentYear}`;
  const lastProposal = await Proposal.findOne({
    where: { case_id: { [Op.like]: `${prefix}%` } },
    order: [["case_id", "DESC"]],
  });
  let nextNumber = 1;
  if (lastProposal && lastProposal.case_id) {
    const lastNumber = parseInt(lastProposal.case_id.split("-").pop());
    nextNumber = lastNumber + 1;
  }
  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`;
};

// GET - Ambil semua proposals dengan filtering dan sorting
router.get("/", async (req, res) => {
  try {
    const { status_pengambilan, search } = req.query;

    const whereConditions = {};

    if (status_pengambilan && status_pengambilan !== "all") {
      whereConditions.status_pengambilan = status_pengambilan;
    }

    if (search) {
      // FIX: Mengganti Op.iLike (PostgreSQL) menjadi Op.like (MySQL)
      whereConditions[Op.or] = [
        { nama_proposal: { [Op.like]: `%${search}%` } },
        { asal_proposal: { [Op.like]: `%${search}%` } },
        { case_id: { [Op.like]: `%${search}%` } },
        { bentuk_donasi: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Proposal.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: PIC,
          // FIX: Menghapus 'email_pic' karena tidak ada di model
          attributes: ["id_pic", "nama_pic"],
        },
      ],
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // FIX: Mengirimkan 'rows' (array) secara langsung agar sesuai dengan frontend lama Anda
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({
      message: "Gagal mengambil data proposal",
      error: error.message,
    });
  }
});

// GET - Ambil proposal berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id, {
      include: [
        {
          model: PIC,
          attributes: ["id_pic", "nama_pic"],
        },
      ],
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data", error: error.message });
  }
});

// POST - Tambah proposal baru
router.post("/", upload.single("file_pendukung"), async (req, res) => {
  try {
    // Logika validasi dipindahkan ke sini
    const { nama_proposal, asal_proposal } = req.body;
    if (!nama_proposal || nama_proposal.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Nama proposal minimal 3 karakter" });
    }
    if (!asal_proposal || asal_proposal.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Asal proposal minimal 3 karakter" });
    }

    const proposalData = req.body;

    // Generate Case ID jika tidak disediakan
    if (!proposalData.case_id) {
      proposalData.case_id = await generateCaseId();
    }

    // Tambahkan nama file ke data jika ada file yang di-upload
    if (req.file) {
      proposalData.file_pendukung = req.file.filename;
    }

    const newProposal = await Proposal.create(proposalData);

    // Ambil kembali data yang baru dibuat beserta data PIC
    const createdProposal = await Proposal.findByPk(newProposal.id_proposal, {
      include: [{ model: PIC, attributes: ["id_pic", "nama_pic"] }],
    });

    res.status(201).json(createdProposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({
      message: "Gagal menambahkan proposal",
      error: error.message,
    });
  }
});

// PUT - Update proposal
router.put("/:id", upload.single("file_pendukung"), async (req, res) => {
  try {
    const { id } = req.params;

    // Logika validasi dipindahkan ke sini
    const { nama_proposal, asal_proposal } = req.body;
    if (!nama_proposal || nama_proposal.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Nama proposal minimal 3 karakter" });
    }
    if (!asal_proposal || asal_proposal.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Asal proposal minimal 3 karakter" });
    }

    const proposal = await Proposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }

    const updateData = req.body;
    // Tambahkan nama file ke data jika ada file baru yang di-upload
    if (req.file) {
      updateData.file_pendukung = req.file.filename;
    }

    await proposal.update(updateData);

    const updatedProposal = await Proposal.findByPk(id, {
      include: [{ model: PIC, attributes: ["id_pic", "nama_pic"] }],
    });

    res.status(200).json(updatedProposal);
  } catch (error) {
    console.error("Error updating proposal:", error);
    res.status(500).json({
      message: "Gagal mengupdate proposal",
      error: error.message,
    });
  }
});

// DELETE - Hapus proposal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }
    await proposal.destroy();
    res.status(200).json({ message: "Proposal berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus proposal", error: error.message });
  }
});

// GET - Dashboard statistics
router.get("/stats/dashboard", async (req, res) => {
  try {
    const total = await Proposal.count();
    const inProgress = await Proposal.count({
      where: { status_pengambilan: "In Progress" },
    });
    const ready = await Proposal.count({
      where: { status_pengambilan: "Siap Diambil" },
    });
    const done = await Proposal.count({
      where: { status_pengambilan: "Done" },
    });

    res.status(200).json({
      success: true,
      data: { total, inProgress, ready, done },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil statistik", error: error.message });
  }
});

module.exports = router;
