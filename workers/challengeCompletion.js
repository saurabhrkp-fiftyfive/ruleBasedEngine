require('dotenv').config();
const squel = require('squel');
const { QueryTypes } = require('sequelize');
const squelMssql = squel.useFlavour('mssql');
const mysqlConnection = require('../models/connectMysql');
const mssqlConnection = require('../models/connectMssql');

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
      eventMessage: { user_id: 108835, timespent: 111, challenge_id: 32604, completion: 'success', score: 120 }
    };

    const { challenge_id } = event.eventMessage;
    // Query Event from database
    let mainQuery = squel.select()
      .field(`module_id`)
      .from(`challenges`)
      .where(`id = ?`, challenge_id).limit(1);

    const challengeModule = await mysqlConnection.query(mainQuery.toString(), { type: QueryTypes.SELECT });

    let module_id = null;

    if (challengeModule.length === 0) {
      console.log(`Module_id not found for ${challenge_id}.`);
    } else {
      module_id = challengeModule[0].module_id;
    }

    console.log({ module_id });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
})();