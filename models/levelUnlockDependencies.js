const { DataTypes } = require('sequelize');
const mysqlConnection = require('./connectMysql');

const LevelUnlockDependencies = mysqlConnection.define('LevelUnlockDependencies',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    unlockLevelId: { type: DataTypes.INTEGER, allowNull: false },
    dependentLevelId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { tableName: 'level_unlock_dependencies' },
);

module.exports = LevelUnlockDependencies;