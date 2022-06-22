const { sendResponse, sendErrorResponse } = require('../helpers');
const Event = require('../models/events');

exports.challengeCompletion = async (req, res, next) => {
  try {
    const { eventName, eventMessage } = req.body;
    if (eventName === '' && eventMessage === '') return sendResponse(res, 201, { message: 'Event is empty' });
    const event = await Event.create({ eventName, eventMessage });
    console.log(`Inserted event: ${event.eventName} with jobId: ${event.jobId}`);
    return sendResponse(res, 200, { message: 'OK', jobId: event.jobId });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};