const { Sequelize } = require('sequelize');

const database = process.env.DB_MSSQL_DATABASE ? process.env.DB_MSSQL_DATABASE : 'masterov2';
const username = process.env.DB_MSSQL_USER ? process.env.DB_MSSQL_USER : 'root';
const password = process.env.DB_MSSQL_PASSWORD ? process.env.DB_MSSQL_PASSWORD : 'root';
const options = {
  host: process.env.DB_MSSQL_HOST ? process.env.DB_MSSQL_HOST : 'localhost',
  port: process.env.DB_MSSQL_PORT ? process.env.DB_MSSQL_PORT : '1443',
  dialect: process.env.DB_MSSQL_DIALECT ? process.env.DB_MSSQL_DIALECT : 'mssql',
};

const mssqlConnection = new Sequelize(database, username, password, options);

/** Test DB Connection is OK. */
(async () => {
  try {
    await mssqlConnection.authenticate();
    console.log('Connection has been established successfully with MSSQL.');
  } catch (error) {
    console.error('Unable to connect to the MSSQL database:', error);
  }
})();

module.exports = mssqlConnection;
