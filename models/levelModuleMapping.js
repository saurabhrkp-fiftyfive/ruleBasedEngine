const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LevelModuleMapping extends Model {
    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  LevelModuleMapping.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      levelId: { type: DataTypes.INTEGER, allowNull: false },
      moduleId: { type: DataTypes.INTEGER, allowNull: false },
      mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      sequelize,
      tableName: 'level_module_mapping',
      modelName: 'LevelModuleMapping',
    },
  );
  return LevelModuleMapping;
};
