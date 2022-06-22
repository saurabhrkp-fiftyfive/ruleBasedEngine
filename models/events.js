const { DataTypes } = require('sequelize');
const mysqlConnection = require('./connectMysql');

const Event = mysqlConnection.define('Event',
  {
    jobId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    eventName: { type: DataTypes.STRING, allowNull: false },
    eventMessage: { type: DataTypes.JSON, allowNull: true },
    status: { type: DataTypes.ENUM('pending', 'initialized', 'completed'), defaultValue: 'pending' }
  },
  { tableName: 'events' }
);

module.exports = Event;