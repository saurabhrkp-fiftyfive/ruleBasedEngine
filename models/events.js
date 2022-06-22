const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Event = sequelize.define('Event',
    {
      jobId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      eventName: { type: DataTypes.STRING, allowNull: false },
      eventMessage: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'initialized', 'completed'), defaultValue: 'pending' }
    },
    { tableName: 'events' }
  );

  Event.associate = (models) => {
    // associations can be defined here
  };

  return Event;
};
