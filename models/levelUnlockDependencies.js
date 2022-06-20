const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class LevelUnlockDependencies extends Model {
    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  LevelUnlockDependencies.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      unlockLevelId: { type: DataTypes.INTEGER, allowNull: false },
      dependentLevelId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      sequelize,
      tableName: 'level_unlock_dependencies',
      modelName: 'LevelUnlockDependencies',
    },
  );
  return LevelUnlockDependencies;
};
