const knex = require('knex');

// Suppress knex warnings
process.noDeprecation = true;

const host = process.env.DB_MYSQL_HOST;
const port = process.env.DB_MYSQL_PORT;
const user = process.env.DB_MYSQL_USER;
const password = process.env.DB_MYSQL_PASSWORD;
const database = process.env.DB_MYSQL_DATABASE;

const connection = { host, port, user, password, database };

const dbConfigurations = { client: 'mysql2', connection, pool: { min: 1, max: 40 } };

exports.mysql = knex(dbConfigurations);
