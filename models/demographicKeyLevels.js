const { DataTypes } = require('sequelize');
const mysqlConnection = require('./connectMysql');

const DemographicKeyLevels = mysqlConnection.define('DemographicKeyLevels',
  {
    demographicKey: { type: DataTypes.STRING, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: false },
    levelId: { type: DataTypes.INTEGER, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false },
    deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { tableName: 'demographic_key_levels' }
);

module.exports = DemographicKeyLevels;