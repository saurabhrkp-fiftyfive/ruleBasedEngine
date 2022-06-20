const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserLevelCompletion extends Model {
    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  UserLevelCompletion.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      levelId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      modulesCompletion: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      completionCriteria: { type: DataTypes.JSON, allowNull: true },
      score: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      sequelize,
      tableName: 'user_level_completion',
      modelName: 'UserLevelCompletion',
    },
  );
  return UserLevelCompletion;
};
