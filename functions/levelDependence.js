const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const { isFalsey } = require('../helpers');

/**
 * Get Level Unlock Dependencies from LevelId
 * @param {Sequelize} mysqlConnection
 * @param {Number} levelId
 * @return {Promise<Array<{unlockLevelId:Number}>>} Unlock Levels
 */
exports.getLevelUnlockDependencies = async (mysqlConnection, levelId) => {
  if (isFalsey(levelId)) return Promise.reject(`Passed - LevelIds: ${levelId}`);
  let mainQuery = squel.select()
    .field(`unlockLevelId`)
    .from(`level_unlock_dependencies`)
    .where(`dependentLevelId = ?`, levelId)
    .where(`deleteFlag = ?`, 0);

  const unlockLevels = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return unlockLevels;
};