const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const MasterStakeholder = require("./masterStakeholder.model");

const RoutineSchedule = sequelize.define(
  "RoutineSchedule",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    stakeholder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "master_stakeholders",
        key: "id",
      },
    },
    pickup_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "pending", "cancelled"),
      defaultValue: "scheduled",
    },
    pic: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proof_file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "routine_schedules",
    timestamps: true,
    underscored: true,
  }
);

// Relasi dengan MasterStakeholder
RoutineSchedule.belongsTo(MasterStakeholder, {
  foreignKey: "stakeholder_id",
  as: "stakeholder",
});

MasterStakeholder.hasMany(RoutineSchedule, {
  foreignKey: "stakeholder_id",
  as: "schedules",
});

module.exports = RoutineSchedule;
