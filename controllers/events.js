const { sendResponse, sendErrorResponse, isFalsey } = require('../helpers');
const Event = require('../models/events');

exports.challengeCompletion = async (req, res, next) => {
  try {
    const EVENT_NAME = 'CHALLENGE_ATTEMPT';
    const { user_id, timespent, challenge_id, completion, score } = req.body;
    if (isFalsey(user_id) || isFalsey(challenge_id) || isFalsey(completion)) return sendResponse(res, 400, { message: 'Event is empty' });
    const user_challenge_attempt = { user_id, timespent, challenge_id, completion, score };
    const event = await Event.create({ eventName: EVENT_NAME, eventMessage: user_challenge_attempt });
    console.log(`Inserted event: ${event.eventName} with jobId: ${event.jobId}`);
    return sendResponse(res, 200, { message: 'OK', jobId: event.jobId });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};