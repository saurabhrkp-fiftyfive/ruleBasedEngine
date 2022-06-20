const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Level extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.LevelModuleMapping, { foreignKey: 'levelId', as: 'levelModuleMapping' });
      this.hasMany(models.LevelUnlockDependencies, { foreignKey: 'levelId', as: 'levelUnlockDependencies' });
    }

    toJSON() {
      return { ...this.get(), id: undefined };
    }
  }

  Level.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      companyId: { type: DataTypes.INTEGER, allowNull: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      criteria: { type: DataTypes.JSON, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deleteFlag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    },
    {
      sequelize,
      tableName: 'levels',
      modelName: 'Level',
    },
  );
  return Level;
};
