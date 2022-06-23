const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
// const squelMssql = squel.useFlavour('mssql');

/**
 * Get Module and Level details for Challenge
 * @param {Sequelize} db_connection
 * @param {Array} challenge_ids
 */
exports.getModuleLevelByChallenge = async (db_connection, challenge_ids) => {
  let mainQuery = squel.select().field(`module_id`).from(`challenges`).where(`id in ?`, challenge_ids);
  const challengeModuleLevel = await db_connection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  console.log(challengeModuleLevel);
  return challengeModuleLevel;
};