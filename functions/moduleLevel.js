const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const { isFalsey } = require('../helpers');

/**
 * Get Module by Level
 * @param {Sequelize} mysqlConnection
 * @param {Array} levelIds
 * @return {Promise<{moduleId:Number, levelId:Number, mandatory:Number}[]>} Module with mandatory flag in levels
 */
exports.getAllModuleInLevel = async (mysqlConnection, levelIds) => {
  if (isFalsey(levelIds)) return Promise.reject(`Passed - LevelIds: ${levelIds}`);
  let mainQuery = squel.select()
    .field(`moduleId`)
    .field(`levelId`)
    .field(`mandatory`)
    .from(`level_module_mapping`)
    .where(`levelId IN ?`, levelIds)
    .where(`deleteFlag = ?`, 0);

  const allModuleInLevel = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(allModuleInLevel)) return Promise.reject(`Module Level Mapping not found for levelIds: ${levelIds.toString()}`);
  return allModuleInLevel;
};