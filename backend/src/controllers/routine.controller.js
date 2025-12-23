const RoutineSchedule = require("../models/routine.model");
const MasterStakeholder = require("../models/masterStakeholder.model");
const { Op } = require("sequelize");

// ==========================================
// MASTER STAKEHOLDER CONTROLLERS
// ==========================================

// GET - Ambil semua master stakeholder
exports.getAllStakeholders = async (req, res) => {
  try {
    const { search, branch, is_active } = req.query;
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { institution_name: { [Op.like]: `%${search}%` } },
        { branch: { [Op.like]: `%${search}%` } },
      ];
    }

    if (branch) {
      whereConditions.branch = branch;
    }

    if (is_active !== undefined) {
      whereConditions.is_active = is_active === "true";
    }

    const stakeholders = await MasterStakeholder.findAll({
      where: whereConditions,
      order: [["institution_name", "ASC"]],
    });

    res.status(200).json(stakeholders);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data stakeholder",
      error: error.message,
    });
  }
};

// POST - Tambah stakeholder baru
exports.createStakeholder = async (req, res) => {
  try {
    const newStakeholder = await MasterStakeholder.create(req.body);
    res.status(201).json(newStakeholder);
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambah stakeholder",
      error: error.message,
    });
  }
};

// PUT - Update stakeholder
exports.updateStakeholder = async (req, res) => {
  try {
    const { id } = req.params;
    const stakeholder = await MasterStakeholder.findByPk(id);

    if (!stakeholder) {
      return res.status(404).json({ message: "Stakeholder tidak ditemukan" });
    }

    await stakeholder.update(req.body);
    res.status(200).json(stakeholder);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengupdate stakeholder",
      error: error.message,
    });
  }
};

// DELETE - Hapus stakeholder
exports.deleteStakeholder = async (req, res) => {
  try {
    const { id } = req.params;
    const stakeholder = await MasterStakeholder.findByPk(id);

    if (!stakeholder) {
      return res.status(404).json({ message: "Stakeholder tidak ditemukan" });
    }

    await stakeholder.destroy();
    res.status(200).json({ message: "Stakeholder berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus stakeholder",
      error: error.message,
    });
  }
};

// ==========================================
// ROUTINE SCHEDULE CONTROLLERS
// ==========================================

// GET - Ambil semua jadwal rutin dengan data stakeholder
exports.getAllRoutines = async (req, res) => {
  try {
    const { month, year, status, search, stakeholder_id } = req.query;
    const whereConditions = {};

    // Filter by date
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      whereConditions.pickup_date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      whereConditions.pickup_date = {
        [Op.between]: [startDate, endDate],
      };
    }

    // Filter by status
    if (status && status !== "all") {
      whereConditions.status = status;
    }

    // Filter by stakeholder
    if (stakeholder_id) {
      whereConditions.stakeholder_id = stakeholder_id;
    }

    const routines = await RoutineSchedule.findAll({
      where: whereConditions,
      include: [
        {
          model: MasterStakeholder,
          as: "stakeholder",
          where: search
            ? {
                [Op.or]: [
                  { institution_name: { [Op.like]: `%${search}%` } },
                  { branch: { [Op.like]: `%${search}%` } },
                ],
              }
            : undefined,
        },
      ],
      order: [["pickup_date", "ASC"]],
    });

    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data kegiatan rutin",
      error: error.message,
    });
  }
};

// GET - Ambil jadwal per stakeholder dengan grouping per bulan
exports.getRoutinesByStakeholder = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const stakeholders = await MasterStakeholder.findAll({
      where: { is_active: true },
      include: [
        {
          model: RoutineSchedule,
          as: "schedules",
          where: {
            pickup_date: {
              [Op.between]: [
                new Date(currentYear, 0, 1),
                new Date(currentYear, 11, 31),
              ],
            },
          },
          required: false,
        },
      ],
      order: [
        ["institution_name", "ASC"],
        [{ model: RoutineSchedule, as: "schedules" }, "pickup_date", "ASC"],
      ],
    });

    res.status(200).json(stakeholders);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data per stakeholder",
      error: error.message,
    });
  }
};

// POST - Tambah jadwal rutin baru
exports.createRoutine = async (req, res) => {
  try {
    const data = req.body;

    // Jika ada file bukti diupload
    if (req.file) {
      data.proof_file = req.file.filename;
    }

    const newRoutine = await RoutineSchedule.create(data);

    // Load relasi stakeholder
    const routineWithStakeholder = await RoutineSchedule.findByPk(
      newRoutine.id,
      {
        include: [
          {
            model: MasterStakeholder,
            as: "stakeholder",
          },
        ],
      }
    );

    res.status(201).json(routineWithStakeholder);
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambah kegiatan rutin",
      error: error.message,
    });
  }
};

// POST - Generate jadwal otomatis untuk semua stakeholder (bulk create)
exports.generateMonthlySchedules = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "Bulan dan tahun harus diisi" });
    }

    // Ambil semua stakeholder aktif
    const stakeholders = await MasterStakeholder.findAll({
      where: { is_active: true },
    });

    const schedulesToCreate = [];

    for (const stakeholder of stakeholders) {
      // Cek apakah sudah ada jadwal di bulan ini
      const existingSchedule = await RoutineSchedule.findOne({
        where: {
          stakeholder_id: stakeholder.id,
          pickup_date: {
            [Op.between]: [
              new Date(year, month - 1, 1),
              new Date(year, month, 0),
            ],
          },
        },
      });

      if (!existingSchedule) {
        // Generate tanggal (misal tanggal 15 setiap bulan, bisa disesuaikan)
        const pickupDate = new Date(year, month - 1, 15);

        schedulesToCreate.push({
          stakeholder_id: stakeholder.id,
          pickup_date: pickupDate,
          quantity: stakeholder.default_quantity,
          status: "scheduled",
        });
      }
    }

    if (schedulesToCreate.length > 0) {
      await RoutineSchedule.bulkCreate(schedulesToCreate);
    }

    res.status(201).json({
      message: `Berhasil generate ${schedulesToCreate.length} jadwal`,
      created: schedulesToCreate.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal generate jadwal bulanan",
      error: error.message,
    });
  }
};

// PUT - Update jadwal rutin
exports.updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const routine = await RoutineSchedule.findByPk(id);

    if (!routine) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    const updateData = req.body;
    if (req.file) {
      updateData.proof_file = req.file.filename;
    }

    await routine.update(updateData);

    // Load relasi stakeholder
    const updatedRoutine = await RoutineSchedule.findByPk(id, {
      include: [
        {
          model: MasterStakeholder,
          as: "stakeholder",
        },
      ],
    });

    res.status(200).json(updatedRoutine);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengupdate kegiatan rutin",
      error: error.message,
    });
  }
};

// DELETE - Hapus jadwal rutin
exports.deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const routine = await RoutineSchedule.findByPk(id);

    if (!routine) {
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    }

    await routine.destroy();
    res.status(200).json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus jadwal",
      error: error.message,
    });
  }
};
