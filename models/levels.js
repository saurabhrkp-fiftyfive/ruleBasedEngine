const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Level = sequelize.define('Level',
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

  return Level;
};
