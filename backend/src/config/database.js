// src/config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("db_csr_monitoring", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
