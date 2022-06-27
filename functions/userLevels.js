const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const { isFalsey } = require('../helpers');

/**
 * Update User Level
 * @param {Sequelize} mysqlConnection
 * @param {Number} userId
 * @param {Number} levelId
 * @param {Object} completions
 * @return {Promise} Promise resolved
 */
exports.updateUserLevelCompletion = async (mysqlConnection, userId, levelId, completions) => {
  if (isFalsey(userId) || isFalsey(levelId)) return Promise.reject(`Passed - UserId: ${userId}, LevelId: ${levelId}`);
  let findQuery = squel.select()
    .field(`id`)
    .from(`user_level_completion`)
    .where(`userId = ?`, userId)
    .where(`levelId = ?`, levelId)
    .where(`deleteFlag = ?`, 0);

  let { modulesCompleted, totalScore, overAllChallengesCompletion, totalChallengesCompleted, totalChallengesLaunched } = completions;
  const completionCriteria = { modulesCompleted, totalChallengesCompleted, totalChallengesLaunched };

  const updateRow = await mysqlConnection.query(findQuery.toString(), { type: QueryTypes.SELECT });

  if (updateRow.length > 0) {
    let updateQuery = squel.update().table(`user_level_completion`)
      .set(`modulesCompletion`, overAllChallengesCompletion)
      .set(`completionCriteria`, JSON.stringify(completionCriteria))
      .set(`score`, totalScore)
      .set(`updatedAt`, `NOW()`, { dontQuote: true });

    await mysqlConnection.query(updateQuery.toString(), { type: QueryTypes.UPDATE });
  } else {
    let insertQuery = squel.insert()
      .into(`user_level_completion`)
      .set(`modulesCompletion`, overAllChallengesCompletion)
      .set(`completionCriteria`, JSON.stringify(completionCriteria))
      .set(`score`, totalScore)
      .set(`userId`, userId)
      .set(`levelId`, levelId)
      .set(`createdAt`, `NOW()`, { dontQuote: true })
      .set(`updatedAt`, `NOW()`, { dontQuote: true });

    await mysqlConnection.query(insertQuery.toString(), { type: QueryTypes.INSERT });
  }
  return;
};

/**
 * Update User Level
 * @param {Sequelize} mysqlConnection
 * @param {Number} userId
 * @param {Number} levelId
 * @return {Promise<Boolean>} Flag indicating whether to launch module for level
 */
exports.updateUserLevel = async (mysqlConnection, userId, levelId) => {
  if (isFalsey(userId) || isFalsey(levelId)) return Promise.reject(`Passed - UserId: ${userId}, LevelId: ${levelId}`);
  let findLevelQuery = squel.select().field(`id`).from(`user_levels`)
    .where(`userId = ?`, userId).where(`levelId = ?`, levelId).where(`deleteFlag = ?`, 0);

  const updateLevelRow = await mysqlConnection.query(findLevelQuery.toString(), { type: QueryTypes.SELECT });
  let launchModule = false;

  if (updateLevelRow.length === 0) {
    let insertLevelQuery = squel.insert().into(`user_levels`)
      .set(`userId`, userId).set(`levelId`, levelId)
      .set(`createdAt`, `NOW()`, { dontQuote: true })
      .set(`updatedAt`, `NOW()`, { dontQuote: true });

    await mysqlConnection.query(insertLevelQuery.toString(), { type: QueryTypes.INSERT });
    launchModule = true;
  }
  return launchModule;
};