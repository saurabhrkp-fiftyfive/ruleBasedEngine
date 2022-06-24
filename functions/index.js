const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const squelMssql = squel.useFlavour('mssql');
const { objectify } = require('../helpers');

/**
 * Get User, Company, Demographic Key
 * @param {Sequelize} mysqlConnection
 * @param {Array} userIds
 */
exports.getUserCompanyDemographicKey = async (mysqlConnection, userIds) => {
  let mainQuery = squel.select()
    .field(`U.id AS userId`)
    .field(`FT.rule_demographic_key`)
    .from(`users AS U`)
    .join(`feature_toggles AS FT ON FT.client_id = U.comp_id`)
    .where(`U.id IN ?`, userIds);

  const userCompanyDemographicKey = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  console.log({ userCompanyDemographicKey });
  if (userCompanyDemographicKey.length === 0) return false;
  const { rule_demographic_key } = userCompanyDemographicKey[0];

  let userQuery = squel.select()
    .field(`TRIM(UPPER(U.${rule_demographic_key})) AS demographic_key`)
    .from(`users AS U`).where(`U.id in ?`, userIds)
    .group(`U.${rule_demographic_key}`);

  const userDemographicKey = await mysqlConnection.query(userQuery.toString(), { type: QueryTypes.SELECT });
  console.log({ userDemographicKey });
  if (userDemographicKey.length === 0) return false;

  return userDemographicKey[0].demographic_key;
};

/**
 * Get User, Levels, Demographic Key
 * @param {Sequelize} mysqlConnection
 * @param {String} demographicKey
 */
exports.getUserLevelsByDemographicKey = async (mysqlConnection, demographicKey) => {
  let mainQuery = squel.select()
    .field(`DKL.levelId`)
    .field(`DKL.order`)
    .from(`demographic_key_levels AS DKL`)
    .where(`DKL.demographicKey = ?`, demographicKey)
    .where(`DKL.deleteFlag = ?`, 0);

  const userLevelsByDemographicKey = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  console.log({ userLevelsByDemographicKey });

  return userLevelsByDemographicKey;
};

/**
 * Get Module and Level details for Challenge
 * @param {Sequelize} mysqlConnection
 * @param {Array} challengeIds
 */
exports.getModuleLevelByChallenge = async (mysqlConnection, challengeIds) => {
  let mainQuery = squel.select()
    .field(`LMM.moduleId`)
    .field(`LMM.levelId`)
    .from(`challenges AS C`)
    .join(`level_module_mapping AS LMM ON LMM.moduleId = C.module_id`)
    .where(`C.id IN ?`, challengeIds)
    .group(`LMM.moduleId, LMM.levelId`);

  const challengeModuleLevel = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return challengeModuleLevel;
};

/**
 * Get Module by Level
 * @param {Sequelize} mysqlConnection
 * @param {Array} levelIds
 */
exports.getAllModuleInLevel = async (mysqlConnection, levelIds) => {
  let mainQuery = squel.select()
    .field(`moduleId`)
    .field(`levelId`)
    .field(`mandatory`)
    .from(`level_module_mapping`)
    .where(`levelId IN ?`, levelIds)
    .where(`deleteFlag = ?`, 0);

  const allModuleInLevel = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return allModuleInLevel;
};

/**
 * Get Level Details from LevelId
 * @param {Sequelize} mysqlConnection
 * @param {Array} levelIds
 */
exports.getLevelDetails = async (mysqlConnection, levelIds) => {
  let mainQuery = squel.select()
    .field(`id AS levelId`)
    .field(`name AS levelName`)
    .field(`criteria AS levelCriteria`)
    .from(`levels`)
    .where(`id IN ?`, levelIds)
    .where(`deleteFlag = ?`, 0);

  const levelDetails = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return levelDetails;
};

/**
 * Get Level Details from LevelId
 * @param {Sequelize} mysqlConnection
 * @param {Sequelize} mssqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 */
exports.getUserCompletionsData = async (mysqlConnection, mssqlConnection, userIds, moduleIds) => {
  const moduleAccess = await getModuleAccess(mssqlConnection, userIds, moduleIds);
  const userChallengesAttempt = await getUserChallengesCompletion(mysqlConnection, userIds, moduleIds);
  const moduleAccessCollection = objectify(moduleAccess, 'key');
  const userChallengesAttemptCollection = objectify(userChallengesAttempt, 'key');
  const userCompletions = getUserCompletions(moduleAccessCollection, userChallengesAttemptCollection);
  return userCompletions;
};

/**
 * Get Module Access Completion Date
 * @param {Sequelize} mssqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 */
const getModuleAccess = async (mssqlConnection, userIds, moduleIds) => {
  let mainQuery = squelMssql.select()
    .field(`MCCU.ModuleID AS moduleId`)
    .field(`CONCAT(UD.UserID,'_',MCCU.ModuleID) AS 'key'`)
    .field(`SUM(CASE WHEN MCCU.Delete_Flag = 0 THEN 1  ELSE 0 END) challenges_launched`)
    .from(`Tbl_Map_Module_Comp_Chalenge_user AS MCCU`)
    .join(`Tbl_Userdetail`, `UD`, `UD.User_Email = MCCU.Useremail`)
    .join(`Tbl_Map_Module_Comp_Chalenge`, `MCC`, `MCC.Chalenge_Map_Id = MCCU.Chalenge_id`)
    .join(`Tbl_Chalenge`, `C`, `C.Chal_Id = MCC.Chalenge_id`)
    .where(`MCCU.Useremail != ''`).where(`UD.UserID IN ?`, userIds).where(`MCC.ModuleID IN ?`, moduleIds)
    .where(`UD.Delete_Flag = 0`).where(`MCC.Delete_Flag = 0`).where(`C.Delete_Flag = 0`)
    .group(`MCCU.ModuleID`).group(`UD.UserID`);

  const moduleAccess = await mssqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return moduleAccess;
};

/**
 * Get Challenge Completion of User
 * @param {Sequelize} mysqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 */
const getUserChallengesCompletion = async (mysqlConnection, userIds, moduleIds) => {
  let mainQuery = squel.select()
    .field(`CONCAT(CA.user_id,'_',C.module_id) AS 'key'`)
    .field(`COUNT(CA.challenge_id) AS challenges_completed`)
    .field(`SUM(CA.timespent) AS total_timespent`);

  let challenges_query = squel.select().field(`id`).from(`challenges`)
    .where(`delete_flag = 0`).where(`module_id IN ?`, moduleIds);

  let subQuery = squel.select()
    .field(`user_id`)
    .field(`challenge_id`)
    .field(`SUM(timespent) 'timespent'`)
    .from('challenge_attempts_bigdaddy')
    .where('challenge_id IN ?', challenges_query)
    .where('user_id IN ?', userIds).where(`completion = 'success'`)
    .group('user_id').group('challenge_id');

  mainQuery.from(`(${subQuery.toString()}) AS CA`)
    .join(squel.select().from(`challenges`), `C`, `C.id = CA.challenge_id`)
    .group(`CA.user_id`).group(`C.module_id`);

  const userChallengesAttempt = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  return userChallengesAttempt;
};

/**
 * Calculate Modules Completion Status
 * @param {Object} modulesAttempt
 * @param {Object} challengesAttempt
 */
const getUserCompletions = (modulesAttempt, challengesAttempt) => {
  let totalChallengesCompleted = 0;
  let totalChallengesLaunched = 0;
  let moduleCompletion = {};

  for (const key in modulesAttempt) {
    const { moduleId, challenges_launched } = modulesAttempt[key];
    let challenges_completed = challengesAttempt.hasOwnProperty(key) ? challengesAttempt[key].challenges_completed : 0;
    if (!moduleCompletion.hasOwnProperty(moduleId)) moduleCompletion[moduleId] = { challenges_launched, challenges_completed };
    totalChallengesCompleted += challenges_completed;
    totalChallengesLaunched += challenges_launched;
  }

  let userCompletions = { moduleCompletion, totalChallengesCompleted, totalChallengesLaunched };
  return userCompletions;
};