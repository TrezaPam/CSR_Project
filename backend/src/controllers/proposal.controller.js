const Proposal = require("../models/proposal.model");
const PIC = require("../models/pic.model");

// --- Fungsi untuk Membuat Proposal Baru (CREATE) ---
exports.createProposal = async (req, res) => {
  try {
    const proposalData = req.body;

    // Jika ada file yang di-upload, simpan nama filenya
    if (req.file) {
      proposalData.file_pendukung = req.file.filename;
    }

    const newProposal = await Proposal.create(proposalData);
    res.status(201).json(newProposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat proposal", error: error.message });
  }
};

// --- Fungsi untuk Mengupdate Proposal (UPDATE) ---
exports.updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id);

    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }

    const updateData = req.body;
    // Jika ada file baru yang di-upload saat edit
    if (req.file) {
      updateData.file_pendukung = req.file.filename;
    }

    await proposal.update(updateData);
    res.status(200).json(proposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui proposal", error: error.message });
  }
};

// --- Fungsi lainnya (getAll, getById, delete) tetap sama ---

exports.getAllProposals = async (req, res) => {
  try {
    const allProposals = await Proposal.findAll({
      include: [{ model: PIC, attributes: ["nama_pic"] }],
    });
    res.status(200).json(allProposals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data proposal", error: error.message });
  }
};

exports.getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findByPk(id, {
      include: [{ model: PIC, attributes: ["nama_pic"] }],
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data proposal", error: error.message });
  }
};

exports.deleteProposal = async (req, res) => {
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
};
