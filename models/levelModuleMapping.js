const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LevelModuleMapping = sequelize.define('LevelModuleMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      levelId: { type: DataTypes.INTEGER, allowNull: false },
      moduleId: { type: DataTypes.INTEGER, allowNull: false },
      mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    { tableName: 'level_module_mapping' },
  );

  return LevelModuleMapping;
};
