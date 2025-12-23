const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MasterStakeholder = sequelize.define(
  "MasterStakeholder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiving_agency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    default_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "master_stakeholders",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MasterStakeholder;
