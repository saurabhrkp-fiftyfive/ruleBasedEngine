require('dotenv').config();
const mysqlConnection = require('../models/connectMysql');
const mssqlConnection = require('../models/connectMssql');
const { launchModules } = require('../functions/modules');
const { getUserCompanyDemographicKey, getUserLevelsByDemographicKey, getModuleLevelByChallenge } = require('../functions');
const { getUserCompletionsData } = require('../functions/completions');
const { getAllModuleInLevel } = require('../functions/moduleLevel');
const { getLevelDetails } = require('../functions/levels');
const { updateUserLevelCompletion, updateUserLevel } = require('../functions/userLevels');

/**
 * 5. Worker to check if update required, check criteria 6 Hours
 *   On Challenge completion get user module
 *   Get level from Module
 *   Update User Level total score and completion percentage
 *   Patch Level criteria
 *   Compare criteria with User level if criteria satified move to step 6 else step 9
 * 6. Update user level 1 Hours
 * 7. Fetch Level Modules to launch 1 Hours
 * 8. Launch Level Modules 1 Hours
 */

/**
 * Main Function call to start process
 */
(async () => {
  try {
    const event = {
      jobId: 'e25332a2-fc26-4382-9578-c60671694e9f', status: 'pending', eventName: 'CHALLENGE_ATTEMPT',
      eventMessage: { user_id: 108835, timespent: 60, challenge_id: 31138, completion: 'success', score: 120 }
    };
    const { user_id, challenge_id, completion, score } = event.eventMessage;
    if (completion === 'success') console.log(`Challenge ${challenge_id} completed successfully with score ${score} by ${user_id}`);
    // Get user's company and then company's demographic key and then user's demographic key-value
    const userDemographicKey = await getUserCompanyDemographicKey(mysqlConnection, user_id);
    const { demographic_key, userEmail, companyId } = userDemographicKey;
    // Get all levels with order by user's demographic key-value
    const userLevelsByDemographicKey = await getUserLevelsByDemographicKey(mysqlConnection, companyId, demographic_key);
    console.log({ userLevelsByDemographicKey });
    // Get current module and level of this challenge Job
    const challengeModuleLevel = await getModuleLevelByChallenge(mysqlConnection, [challenge_id]);
    console.log({ challengeModuleLevel });
    // Get module level
    const { levelId } = challengeModuleLevel;
    // Get level details and criteria
    const levelDetails = await getLevelDetails(mysqlConnection, [levelId]);
    console.log({ levelDetails });
    // Get criteria details
    const { levelCriteria } = levelDetails;
    console.log({ levelCriteria });
    // Get all modules in level with mandatory status
    const allModuleInLevel = await getAllModuleInLevel(mysqlConnection, [levelId]);
    console.log({ allModuleInLevel });
    // Get all modules to get completion status
    const moduleIds = allModuleInLevel.map((row) => row.moduleId);
    console.log({ moduleIds });
    // Get users completion data for level modules
    const userCompletions = await getUserCompletionsData(mysqlConnection, mssqlConnection, [user_id], moduleIds);
    console.log({ userCompletions });
    // Get completion data for saving and calculations
    const { moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched, totalScore } = userCompletions;
    console.log({ moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched, totalScore });
    // Get mandatory modules and completion percentage criteria
    const { mandatoryModuleCompletion, completionPercentage } = levelCriteria;
    console.log({ mandatoryModuleCompletion, completionPercentage });
    let mandatoryModulesCompleted = true;
    // Check if level has mandatory modules completion
    if (mandatoryModuleCompletion) {
      mandatoryModulesCompleted = false;
      // Get all mandatory modules
      const mandatoryModuleIds = allModuleInLevel.filter((row) => { return row.mandatory === 1; }).map((row) => row.moduleId);
      console.log({ mandatoryModuleIds });
      // Check if all mandatory modules are completed
      mandatoryModulesCompleted = moduleCompletion.filter(row => { return mandatoryModuleIds.includes(row.moduleId); }).every((row) => row.moduleCompleted === true);
    }
    // Check if user completions percentage is equal to or greater than required completion percentage
    const completionPercentageMet = overAllChallengesCompletion >= completionPercentage;
    console.log({ mandatoryModulesCompleted, completionPercentageMet });
    // Create completion details to save for user level completion
    let completions = { modulesCompleted, totalScore, overAllChallengesCompletion, totalChallengesCompleted, totalChallengesLaunched };
    await updateUserLevelCompletion(mysqlConnection, user_id, levelId, completions);
    // If user has completed current level by criteria
    if (completionPercentageMet && mandatoryModulesCompleted) {
      console.log(`Level Completion Criteria met`);
      // Get current level and its order from level details
      const currentlevel = userLevelsByDemographicKey.find((row) => row.levelId === levelId);
      console.log({ currentlevel });
      const currentlevelOrder = currentlevel.order;
      // Then fetch next level by order
      const nextLevelByOrder = userLevelsByDemographicKey.find((row) => row.order > currentlevelOrder);
      if (nextLevelByOrder === undefined) {
        console.log(`No next level, Completed Job`);
        process.exit();
      }
      console.log({ nextLevelByOrder });
      let nextLevelId = nextLevelByOrder.levelId;
      // Check if user is already upgraded to next level
      await updateUserLevel(mysqlConnection, user_id, levelId);
      const launchModule = await updateUserLevel(mysqlConnection, user_id, nextLevelId);
      if (launchModule) {
        // Get all modules in next level
        const allModuleInNextLevel = await getAllModuleInLevel(mysqlConnection, [nextLevelId]);
        console.log({ allModuleInNextLevel });
        // Get module Id to launch
        const moduleIdsToLaunch = allModuleInNextLevel.map((module) => module.moduleId);
        // Launch all modules to user
        await launchModules(companyId, moduleIdsToLaunch, [userEmail]);
      }
    }
    console.log(`Completed Job`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();