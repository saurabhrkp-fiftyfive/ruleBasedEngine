const { DataTypes } = require('sequelize');
const sequelizeConnection = require('./index');

const Event = sequelizeConnection.define('Event',
  {
    jobId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    eventName: { type: DataTypes.STRING, allowNull: false },
    eventMessage: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'initialized', 'completed'), defaultValue: 'pending' }
  },
  { tableName: 'events' }
);

module.exports = Event;