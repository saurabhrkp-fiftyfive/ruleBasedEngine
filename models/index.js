const { Sequelize } = require('sequelize');

const database = process.env.DB_MYSQL_DATABASE ? process.env.DB_MYSQL_DATABASE : 'mastero';
const username = process.env.DB_MYSQL_USER ? process.env.DB_MYSQL_USER : 'root';
const password = process.env.DB_MYSQL_PASSWORD ? process.env.DB_MYSQL_PASSWORD : 'root';
const options = {
  host: process.env.DB_MYSQL_HOST ? process.env.DB_MYSQL_HOST : 'localhost',
  dialect: process.env.DB_MYSQL_DIALECT ? (process.env.DB_MYSQL_DIALECT) : ('mysql'),
};

const sequelizeConnection = new Sequelize(database, username, password, options);

/** Test DB Connection is OK. */
(async () => {
  try {
    await sequelizeConnection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelizeConnection;
