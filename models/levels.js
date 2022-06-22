const { DataTypes } = require('sequelize');
const sequelizeConnection = require('./index');

const Level = sequelizeConnection.define('Level',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    criteria: { type: DataTypes.JSON, allowNull: true },
    deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  },
  { tableName: 'levels' }
);

Level.associate = (models) => {
  Level.hasMany(models.LevelModuleMapping, { foreignKey: 'levelId', as: 'levelModuleMapping' });
  Level.hasMany(models.LevelUnlockDependencies, { foreignKey: 'levelId', as: 'levelUnlockDependencies' });
};

module.exports = Level;