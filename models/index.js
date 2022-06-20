const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const basename = path.basename(__filename);
const database = process.env.DB_MYSQL_DATABASE ? process.env.DB_MYSQL_DATABASE : 'mastero';
const username = process.env.DB_MYSQL_USER ? process.env.DB_MYSQL_USER : 'root';
const password = process.env.DB_MYSQL_PASSWORD ? process.env.DB_MYSQL_PASSWORD : 'root';
const options = {
  host: process.env.DB_MYSQL_HOST ? process.env.DB_MYSQL_HOST : 'localhost',
  dialect: process.env.DB_MYSQL_DIALECT ? (process.env.DB_MYSQL_DIALECT) : ('mysql'),
};
const db = {};

const sequelize = new Sequelize(database, username, password, options);

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

exports.sequelize;
module.exports = db;
