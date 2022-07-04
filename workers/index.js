require('dotenv').config();
const mysqlConnection = require('../models/connectMysql');
const mssqlConnection = require('../models/connectMssql');
const { getUserCompanyDemographicKey, getUserLevelsByDemographicKey, getModuleLevelByChallenge } = require('../functions');
const { updateUserLevelCompletion, updateUserLevel } = require('../functions/userLevels');
const { getLevelUnlockDependencies } = require('../functions/levelDependence');
const { getUserCompletionsData } = require('../functions/completions');
const { getAllModuleInLevel } = require('../functions/moduleLevel');
const { getLevelDetails } = require('../functions/levels');
const { launchModules } = require('../functions/modules');

const showConsoleLogs = false;

exports.challengeAttemptEventHandler = async (challengeAttempt) => {
  const { user_id, challenge_id, completion, score } = challengeAttempt;
  // TODO: Discuss on whether to continue or not on lose
  if (completion === 'success') console.log(`Challenge ${challenge_id} completed successfully with score ${score} by ${user_id}`);
  // Get user's company and then company's demographic key and then user's demographic key-value
  const userDemographicKey = await getUserCompanyDemographicKey(mysqlConnection, user_id);
  const { demographic_key, userEmail, companyId } = userDemographicKey;
  // Get all levels with order by user's demographic key-value
  const userLevelsByDemographicKey = await getUserLevelsByDemographicKey(mysqlConnection, companyId, demographic_key);
  showConsoleLogs && console.log({ userLevelsByDemographicKey });
  // Get current module and level of this challenge Job
  const challengeModuleLevel = await getModuleLevelByChallenge(mysqlConnection, [challenge_id]);
  showConsoleLogs && console.log({ challengeModuleLevel });
  // Get module level
  const { levelId } = challengeModuleLevel;
  // Get level details and criteria
  const levelDetails = await getLevelDetails(mysqlConnection, [levelId]);
  showConsoleLogs && console.log({ levelDetails });
  // Get criteria details
  const { levelCriteria } = levelDetails;
  showConsoleLogs && console.log({ levelCriteria });
  // Get all modules in level with mandatory status
  const allModuleInLevel = await getAllModuleInLevel(mysqlConnection, [levelId]);
  showConsoleLogs && console.log({ allModuleInLevel });
  // Get all modules to get completion status
  const moduleIds = allModuleInLevel.map((row) => row.moduleId);
  showConsoleLogs && console.log({ moduleIds });
  // Get users completion data for level modules
  const userCompletions = await getUserCompletionsData(mysqlConnection, mssqlConnection, [user_id], moduleIds);
  showConsoleLogs && console.log({ userCompletions });
  // Get completion data for saving and calculations
  // TODO: Get all over module Completions
  const { moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched, totalScore } = userCompletions;
  showConsoleLogs && console.log({ moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched, totalScore });
  // Get mandatory modules and completion percentage criteria
  const { mandatoryModuleCompletion, completionPercentage } = levelCriteria;
  showConsoleLogs && console.log({ mandatoryModuleCompletion, completionPercentage });
  let mandatoryModulesCompleted = true;
  // Check if level has mandatory modules completion
  if (mandatoryModuleCompletion) {
    mandatoryModulesCompleted = false;
    // Get all mandatory modules
    const mandatoryModuleIds = allModuleInLevel.filter((row) => { return row.mandatory === 1; }).map((row) => row.moduleId);
    showConsoleLogs && console.log({ mandatoryModuleIds });
    // Check if all mandatory modules are completed
    mandatoryModulesCompleted = moduleCompletion.filter(row => { return mandatoryModuleIds.includes(row.moduleId); }).every((row) => row.moduleCompleted === true);
  }
  // Check if user completions percentage is equal to or greater than required completion percentage
  const completionPercentageMet = overAllChallengesCompletion >= completionPercentage;
  showConsoleLogs && console.log({ mandatoryModulesCompleted, completionPercentageMet });
  // Create completion details to save for user level completion
  let completions = { modulesCompleted, totalScore, overAllChallengesCompletion, totalChallengesCompleted, totalChallengesLaunched };
  await updateUserLevelCompletion(mysqlConnection, user_id, levelId, completions);
  // If user has completed current level by criteria
  if (completionPercentageMet && mandatoryModulesCompleted) {
    console.log(`Level Completion Criteria met`);
    // Check if user is already upgraded to next level
    await updateUserLevel(mysqlConnection, user_id, levelId);
    // Get levels from unlock dependencies of level
    const unlockLevels = await getLevelUnlockDependencies(mysqlConnection, levelId);
    showConsoleLogs && console.log({ unlockLevels });
    // Then fetch next level by order
    if (unlockLevels.length === 0) {
      console.log(`No next level, Completed Job`);
      return Promise.resolve();
    }
    for (const unlockLevel of unlockLevels) {
      const launchModule = await updateUserLevel(mysqlConnection, user_id, unlockLevel);
      if (launchModule) {
        // Get all modules in next level
        const allModuleInNextLevel = await getAllModuleInLevel(mysqlConnection, [unlockLevel]);
        showConsoleLogs && console.log({ allModuleInNextLevel });
        // Get module Id to launch
        const moduleIdsToLaunch = allModuleInNextLevel.map((module) => module.moduleId);
        // Launch all modules to user
        await launchModules(companyId, moduleIdsToLaunch, [userEmail]);
      }
    }
  }
  console.log(`Completed Job`);
  return Promise.resolve();
};