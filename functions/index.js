const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const { isFalsey } = require('../helpers');

/**
 * Get User, Company, Demographic Key
 * @param {Sequelize} mysqlConnection
 * @param {Number} userId
 * @return {Promise<{demographic_key:String, companyId:Number, userEmail:String}>} User Company Demographic Key
 */
exports.getUserCompanyDemographicKey = async (mysqlConnection, userId) => {
  if (isFalsey(userId)) return Promise.reject(`Passed - UserIds: ${userId}`);
  let mainQuery = squel.select()
    .field(`U.id AS userId`)
    .field(`FT.rule_demographic_key`)
    .field(`U.comp_id`)
    .from(`users AS U`)
    .join(`feature_toggles AS FT ON FT.client_id = U.comp_id`)
    .where(`U.id = ?`, userId);

  const userCompanyDemographicKey = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(userCompanyDemographicKey)) return Promise.reject(`User Not Found with id: ${userId}`);

  const { rule_demographic_key, comp_id } = userCompanyDemographicKey[0];
  if (isFalsey(rule_demographic_key)) return Promise.reject(`Rule Not Found for companyId: ${comp_id}`);

  let userQuery = squel.select()
    .field(`TRIM(UPPER(U.${rule_demographic_key})) AS demographic_key`)
    .field(`U.comp_id AS companyId`)
    .field(`U.email AS userEmail`)
    .from(`users AS U`).where(`U.id = ?`, userId)
    .group(`U.${rule_demographic_key}`);

  const userDemographicKey = await mysqlConnection.query(userQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(userDemographicKey)) return Promise.reject(`User ${rule_demographic_key} Not Found for companyId: ${comp_id}`);
  return userDemographicKey[0];
};

/**
 * Get User, Levels, Demographic Key
 * @param {Sequelize} mysqlConnection
 * @param {Number} companyId
 * @param {String} demographicKey
 * @return {Promise<{levelId:Number, order:Number}[]>} Level for user demographic key with order
 */
exports.getUserLevelsByDemographicKey = async (mysqlConnection, companyId, demographicKey) => {
  if (isFalsey(companyId) || isFalsey(demographicKey)) return Promise.reject(`Passed - CompanyId: ${companyId}, demographicKey: ${demographicKey}`);
  let mainQuery = squel.select()
    .field(`DKL.levelId`)
    .field(`DKL.order`)
    .from(`demographic_key_levels AS DKL`)
    .where(`DKL.companyId = ?`, companyId)
    .where(`DKL.demographicKey = ?`, demographicKey)
    .where(`DKL.deleteFlag = ?`, 0)
    .order(`DKL.order`);

  const userLevelsByDemographicKey = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(userLevelsByDemographicKey)) return Promise.reject(`Level not found for ${demographicKey} in companyId: ${companyId}`);
  return userLevelsByDemographicKey;
};

/**
 * Get Module and Level details for Challenge
 * @param {Sequelize} mysqlConnection
 * @param {Array} challengeIds
 * @return {Promise<{moduleId:Number, levelId:Number}>} Module Level by challenge
 */
exports.getModuleLevelByChallenge = async (mysqlConnection, challengeIds) => {
  if (isFalsey(challengeIds)) return Promise.reject(`Passed - ChallengeIds: ${challengeIds}`);
  let mainQuery = squel.select()
    .field(`LMM.moduleId`)
    .field(`LMM.levelId`)
    .from(`challenges AS C`)
    .join(`level_module_mapping AS LMM ON LMM.moduleId = C.module_id`)
    .where(`C.id IN ?`, challengeIds)
    .group(`LMM.moduleId, LMM.levelId`);

  const challengeModuleLevel = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(challengeModuleLevel)) return Promise.reject(`Module Level Mapping not found for challenge: ${challengeIds.toString()}`);
  return challengeModuleLevel[0];
};