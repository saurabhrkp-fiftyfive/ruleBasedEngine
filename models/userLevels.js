const { DataTypes } = require('sequelize');
const mysqlConnection = require('./connectMysql');

const UserLevels = mysqlConnection.define('UserLevels',
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    levelId: { type: DataTypes.INTEGER, allowNull: true },
    deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { tableName: 'user_levels' }
);

module.exports = UserLevels;