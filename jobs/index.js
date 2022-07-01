require('dotenv').config();
const Event = require('../models/events');
const { challengeAttemptEventHandler } = require('../workers');

const EVENT_NAME = 'CHALLENGE_ATTEMPT';

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
      const { jobId, eventMessage, createdAt } = event;
      console.log(`Event found: ${jobId} createdAt: ${createdAt}`);
      await Event.update({ status: 'initialized' }, { where: { jobId } });
      console.log(`Updated ${jobId} to initialized`);
      await challengeAttemptEventHandler(eventMessage);
      await Event.destroy({ where: { jobId } });
      console.log(`Deleted ${jobId}`);
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