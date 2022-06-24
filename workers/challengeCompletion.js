require('dotenv').config();
const mysqlConnection = require('../models/connectMysql');
const mssqlConnection = require('../models/connectMssql');
const { getUserCompanyDemographicKey, getUserLevelsByDemographicKey, getModuleLevelByChallenge, getAllModuleInLevel, getLevelDetails, getUserCompletionsData } = require('../functions');

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
      jobId: 'e25332a2-fc26-4382-9578-c60671694e9f', status: 'pending', eventName: 'CHALLENGE_COMPLETED',
      eventMessage: { user_id: 108835, timespent: 60, challenge_id: 31138, completion: 'success', score: 120 }
    };
    const { user_id, challenge_id, completion, score } = event.eventMessage;
    if (completion === 'success') console.log(`Challenge ${challenge_id} completed successfully with score ${score} by ${user_id}`);
    // Query Event from database
    const userDemographicKey = await getUserCompanyDemographicKey(mysqlConnection, [user_id]);
    const userLevelsByDemographicKey = await getUserLevelsByDemographicKey(mysqlConnection, userDemographicKey);
    console.log({ userLevelsByDemographicKey });
    const challengeModuleLevel = await getModuleLevelByChallenge(mysqlConnection, [challenge_id]);
    if (challengeModuleLevel.length > 0) {
      console.log({ challengeModuleLevel });
      const { levelId } = challengeModuleLevel[0];
      const levelDetails = await getLevelDetails(mysqlConnection, [levelId]);
      console.log({ levelDetails });
      const { levelCriteria } = levelDetails[0];
      console.log({ levelCriteria });
      const allModuleInLevel = await getAllModuleInLevel(mysqlConnection, [levelId]);
      console.log({ allModuleInLevel });
      const moduleIds = allModuleInLevel.map((row) => row.moduleId);
      console.log({ moduleIds });
      const userCompletions = await getUserCompletionsData(mysqlConnection, mssqlConnection, [user_id], moduleIds);
      console.log({ userCompletions });
      const { moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched } = userCompletions;
      console.log({ moduleCompletion, overAllChallengesCompletion, modulesCompleted, totalChallengesCompleted, totalChallengesLaunched });
      const { mandatoryModuleCompletion, completionPercentage } = levelCriteria;
      console.log({ mandatoryModuleCompletion, completionPercentage });
      let mandatoryModulesCompleted = true;
      if (mandatoryModuleCompletion) {
        mandatoryModulesCompleted = false;
        const mandatoryModuleIds = allModuleInLevel.filter((row) => { return row.mandatory === 1; }).map((row) => row.moduleId);
        console.log({ mandatoryModuleIds });
        mandatoryModulesCompleted = moduleCompletion.filter(row => { return mandatoryModuleIds.includes(row.moduleId); }).every((row) => row.moduleCompleted === true);
      }
      console.log({ mandatoryModulesCompleted });
      const completionPercentageMet = overAllChallengesCompletion >= completionPercentage;
      console.log({ completionPercentageMet });
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();