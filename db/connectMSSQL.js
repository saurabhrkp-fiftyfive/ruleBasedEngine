const knex = require('knex');

// Suppress knex warnings
process.noDeprecation = true;

const host = process.env.DB_MSSQL_HOST;
const port = process.env.DB_MSSQL_PORT;
const user = process.env.DB_MSSQL_USER;
const password = process.env.DB_MSSQL_PASSWORD;
const database = process.env.DB_MSSQL_DATABASE;

const connection = { host, port, user, password, database, requestTimeout: 60000 };

const dbConfigurations = { client: 'mssql', connection, pool: { min: 1, max: 80 } };

exports.mssql = knex(dbConfigurations);
