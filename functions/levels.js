const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const { isFalsey } = require('../helpers');

/**
 * Get Level Details from LevelId
 * @param {Sequelize} mysqlConnection
 * @param {Array} levelIds
 * @return {Promise<{levelId:Number, levelName:String, criteria:Object}>} Level Details
 */
exports.getLevelDetails = async (mysqlConnection, levelIds) => {
  if (isFalsey(levelIds)) return Promise.reject(`Passed - LevelIds: ${levelIds}`);
  let mainQuery = squel.select()
    .field(`id AS levelId`)
    .field(`name AS levelName`)
    .field(`criteria AS levelCriteria`)
    .from(`levels`)
    .where(`id IN ?`, levelIds)
    .where(`deleteFlag = ?`, 0);

  const levelDetails = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(levelDetails)) return Promise.reject(`Level not found for levelIds: ${levelIds.toString()}`);
  return levelDetails[0];
};