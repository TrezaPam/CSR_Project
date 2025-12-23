const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PIC = require('./pic.model');

const Proposal = sequelize.define('Proposal', {
  id_proposal: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  case_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  nama_proposal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asal_proposal: {
    type: DataTypes.STRING
  },
  tanggal_masuk: {
    type: DataTypes.DATE
  },
  bentuk_donasi: {
    type: DataTypes.TEXT
  },
  status_approval: {
    type: DataTypes.STRING(50)
  },
  jumlah_produk: {
    type: DataTypes.STRING
  },
  // --- KOLOM BARU DITAMBAHKAN DI SINI ---
  detail_produk: {
    type: DataTypes.TEXT
  },
  total_harga: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  catatan: {
    type: DataTypes.TEXT
  },
  file_pendukung: {
    type: DataTypes.STRING
  },
  // --- AKHIR DARI KOLOM BARU ---
  tipe_proposal: {
    type: DataTypes.ENUM('Sekali Jalan', 'Rutin', 'Berkelanjutan', 'Tahunan'),
    allowNull: false,
    defaultValue: 'Sekali Jalan'
  },
  status_pengambilan: {
    type: DataTypes.ENUM('In Progress', 'Siap Diambil', 'Done'),
    allowNull: false,
    defaultValue: 'In Progress'
  },
  id_pic: {
    type: DataTypes.INTEGER,
    references: {
      model: PIC,
      key: 'id_pic'
    }
  }
}, {
  tableName: 'proposals',
  timestamps: true
});

Proposal.belongsTo(PIC, { foreignKey: 'id_pic' });
PIC.hasMany(Proposal, { foreignKey: 'id_pic' });

module.exports = Proposal;
