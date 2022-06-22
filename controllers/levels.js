const { sendResponse, sendErrorResponse } = require('../helpers');
const Level = require('../models/levels');

exports.createLevel = async (req, res, next) => {
  try {
    const levels = await Level.findAll();
    return sendResponse(res, 200, { message: 'OK', levels });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};