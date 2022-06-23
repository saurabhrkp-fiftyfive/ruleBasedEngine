const { sendResponse, sendErrorResponse, isFalsey } = require('../helpers');
const Level = require('../models/levels');

const DEFAULT_CRITERIA = {
  mandatoryModuleCompletion: false,
  completionPercentage: 70,
  noModuleAttempts: true,
};

exports.createLevel = async (req, res, next) => {
  try {
    let { companyId, name, criteria } = req.body;
    if (isFalsey(companyId) || isFalsey(name)) return sendResponse(res, 201, { message: 'Required fields are empty' });
    let levelCriteria = { ...DEFAULT_CRITERIA, ...criteria };
    let level = { companyId, name, criteria: levelCriteria };
    const newLevel = await Level.create(level);
    return sendResponse(res, 200, { message: 'OK', newLevel });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};