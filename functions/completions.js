const { QueryTypes, Sequelize } = require('sequelize');
const squel = require('squel');
const squelMssql = squel.useFlavour('mssql');
const { isFalsey, objectify } = require('../helpers');

/**
 * Get Level Details from LevelId
 * @param {Sequelize} mysqlConnection
 * @param {Sequelize} mssqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 * @return {Promise<{moduleCompletion:{moduleId:Number,challenges_launched:Number,challenges_completed:Number,moduleScore:Number,moduleCompleted:Boolean}[],modulesCompleted:Number[],totalScore:Number,overAllChallengesCompletion:Number,totalChallengesCompleted:Number,totalChallengesLaunched:Number}>} User Completions
 */
exports.getUserCompletionsData = async (mysqlConnection, mssqlConnection, userIds, moduleIds) => {
  if (isFalsey(userIds) || isFalsey(moduleIds)) return Promise.reject(`Passed - UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
  const moduleAccessCollection = await getModuleAccess(mssqlConnection, userIds, moduleIds);
  const moduleScoresCollection = await getUserScores(mssqlConnection, userIds, moduleIds);
  const userChallengesAttemptCollection = await getUserChallengesCompletion(mysqlConnection, userIds, moduleIds);
  const userCompletions = getUserCompletions(moduleAccessCollection, userChallengesAttemptCollection, moduleScoresCollection);
  return userCompletions;
};

/**
 * Get Module Access Completion Date
 * @param {Sequelize} mssqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 * @return {Promise<Object>} User Module Access Completion Date
 */
const getModuleAccess = async (mssqlConnection, userIds, moduleIds) => {
  if (isFalsey(userIds) || isFalsey(moduleIds)) return Promise.reject(`Passed - UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
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
  if (isFalsey(moduleAccess)) return Promise.reject(`No Module Access found for UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
  const moduleAccessCollection = objectify(moduleAccess, 'key');
  return moduleAccessCollection;
};

/**
 * Get Challenge Completion of User
 * @param {Sequelize} mysqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 * @return {Promise<Object>} User Challenge Attempts
 */
const getUserChallengesCompletion = async (mysqlConnection, userIds, moduleIds) => {
  if (isFalsey(userIds) || isFalsey(moduleIds)) return Promise.reject(`Passed - UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
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
  if (isFalsey(userChallengesAttempt)) return Promise.reject(`No Challenge Attempt found for UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
  const userChallengesAttemptCollection = objectify(userChallengesAttempt, 'key');
  return userChallengesAttemptCollection;
};

/**
 * Get Module Access Completion Date
 * @param {Sequelize} mssqlConnection
 * @param {Array} userIds
 * @param {Array} moduleIds
 * @return {Promise<Object>} User Modules Scores
 */
const getUserScores = async (mssqlConnection, userIds, moduleIds) => {
  let mainQuery = squelMssql.select()
    .field(`CONCAT(Scores.UserID,'_',Scores.Module_id) AS 'key'`)
    .field(`SUM(Scores.score) AS score`);

  let subQuery = squelMssql.select()
    .field(`UD.UserID`)
    .field(`S.Challenge_id`)
    .field(`S.Module_id`)
    .field(`MAX(S.Score) AS score`)
    .from(`Tbl_Userdetail AS UD`)
    .join(squelMssql.select().from(`Tbl_Score`), `S`, `S.User_email = UD.User_Email`)
    .where(`S.Module_id IN ?`, moduleIds).where(`UD.UserID IN ?`, userIds)
    .group(`S.User_email`).group(`S.Challenge_id`)
    .group(`S.Module_id`).group(`UD.UserID`);

  mainQuery.from(`(${subQuery.toString()}) AS Scores`).group(`Scores.Module_id`).group(`Scores.UserID`);

  const moduleScores = await mssqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });
  if (isFalsey(moduleScores)) return Promise.reject(`No Module score found for UserIds: ${userIds}, ModuleIds: ${moduleIds}`);
  const moduleScoresCollection = objectify(moduleScores, 'key');
  return moduleScoresCollection;
};

/**
 * Calculate Modules Completion Status
 * @param {Object} modulesAttempt
 * @param {Object} challengesAttempt
 * @return {{moduleCompletion:{moduleId:Number,challenges_launched:Number,challenges_completed:Number,moduleScore:Number,moduleCompleted:Boolean}[],modulesCompleted:Number[],totalScore:Number,overAllChallengesCompletion:Number,totalChallengesCompleted:Number,totalChallengesLaunched:Number}} User Completions
 */
const getUserCompletions = (modulesAttempt, challengesAttempt, moduleScores) => {
  let totalChallengesCompleted = 0;
  let totalChallengesLaunched = 0;
  let totalScore = 0;
  let moduleCompletion = [];

  for (const key in modulesAttempt) {
    const { moduleId, challenges_launched } = modulesAttempt[key];
    let challenges_completed = challengesAttempt.hasOwnProperty(key) ? challengesAttempt[key].challenges_completed : 0;
    let moduleScore = moduleScores.hasOwnProperty(key) ? moduleScores[key].score : 0;
    let moduleCompleted = challenges_launched === challenges_completed;
    moduleCompletion.push({ moduleId, challenges_launched, challenges_completed, moduleScore, moduleCompleted });
    totalChallengesCompleted += challenges_completed;
    totalChallengesLaunched += challenges_launched;
    totalScore += moduleScore;
  }
  let overAllChallengesCompletion = Math.round((totalChallengesCompleted / totalChallengesLaunched) * 100);
  let modulesCompleted = moduleCompletion.filter((row) => { return row.moduleCompleted === true; }).map((row) => row.moduleId);
  let userCompletions = { moduleCompletion, modulesCompleted, totalScore, overAllChallengesCompletion, totalChallengesCompleted, totalChallengesLaunched };
  return userCompletions;
};