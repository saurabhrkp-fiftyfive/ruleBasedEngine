require('dotenv').config();
const Event = require('../models/events');

const EVENT_NAME = 'CHALLENGE_COMPLETED';

/**
 * Main Function call to start process
 */
(async () => {
  try {
    let scriptStartedOn = new Date();
    console.log(`Started at ${scriptStartedOn}`);
    // Query Event from database
    const event = await Event.findOne({ where: { eventName: EVENT_NAME, status: 'pending' }, order: [['createdAt']] });
    // Check event exsist
    if (event) {
      console.log(`Event found: ${event.jobId} createdAt: ${event.createdAt}`);
      await Event.update({ status: 'initialized' }, { where: { jobId: event.jobId } });
      console.log(`Updated ${event.jobId} to initialized`);
      await Event.destroy({ where: { jobId: event.jobId } });
      console.log(`Deleted ${event.jobId}`);
    }
    let scriptEndedOn = new Date();
    console.log(`Ended at ${scriptEndedOn}`);
    console.log(`Cron duration: ${scriptEndedOn - scriptStartedOn} milliseconds.`);
    console.log(`-----------------------------SUCCESS-----------------------------------`);
    process.exit();
  } catch (error) {
    console.error(error);
    console.log(`Ended at ${new Date()}.`);
    console.log(`-----------------------------ERRORED-----------------------------------`);
    process.exit();
  }
})();