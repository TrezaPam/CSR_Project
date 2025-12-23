// src/models/pic.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PIC = sequelize.define(
  "PIC",
  {
    id_pic: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_pic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jabatan: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "pic", // Nama tabel di database
    timestamps: false, // Tidak menggunakan kolom createdAt/updatedAt
  }
);

module.exports = PIC;
