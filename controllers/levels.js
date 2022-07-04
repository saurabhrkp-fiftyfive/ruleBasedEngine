const { sendResponse, sendErrorResponse, isFalsey } = require('../helpers');
const Level = require('../models/levels');
const LevelModuleMapping = require('../models/levelModuleMapping');
const DemographicKeyLevels = require('../models/demographicKeyLevels');
const LevelUnlockDependencies = require('../models/levelUnlockDependencies');

const DEFAULT_CRITERIA = {
  mandatoryModuleCompletion: false,
  completionPercentage: 70,
  noModuleAttempts: true,
};

exports.createLevel = async (req, res, next) => {
  try {
    let { companyId, name, criteria } = req.body;
    if (isFalsey(companyId) || isFalsey(name)) return sendResponse(res, 400, { message: 'Required fields are empty' });
    let levelCriteria = { ...DEFAULT_CRITERIA, ...criteria };
    let level = { companyId, name, criteria: levelCriteria };
    await Level.create(level);
    return sendResponse(res, 200, { message: 'Created Level.' });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};

exports.addModulesToLevel = async (req, res, next) => {
  try {
    let { levelId, moduleIds, mandatoryModuleIds } = req.body;
    if (isFalsey(levelId) || isFalsey(moduleIds)) return sendResponse(res, 400, { message: 'Required fields are empty' });
    for (let moduleId of moduleIds) {
      let levelModule = { levelId, moduleId, mandatory: false };
      await LevelModuleMapping.create(levelModule);
    }
    if (mandatoryModuleIds.length > 0) {
      for (let mandatoryModuleId of mandatoryModuleIds) {
        let levelMandatoryModule = { levelId, moduleId: mandatoryModuleId, mandatory: true };
        await LevelModuleMapping.create(levelMandatoryModule);
      }
    }
    return sendResponse(res, 200, { message: 'Inserted level module successfully.' });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};

exports.mapDemographicKeyToLevel = async (req, res, next) => {
  try {
    let { levelId, companyId, demographicKey, order } = req.body;
    if (isFalsey(levelId) || isFalsey(demographicKey) || isFalsey(companyId) || isFalsey(order)) return sendResponse(res, 400, { message: 'Required fields are empty' });
    let mappingFound = await DemographicKeyLevels.findAll({ where: { demographicKey, levelId, companyId, order, deleteFlag: false } });
    if (mappingFound.length > 0) return sendResponse(res, 409, { message: 'Mapping found' });
    await DemographicKeyLevels.create({ levelId, companyId, demographicKey, order });
    return sendResponse(res, 200, { message: 'Inserted level DemographicKey Mapping successfully.' });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};

exports.mapUnlockLevelDependencies = async (req, res, next) => {
  try {
    let { unlockLevelId, dependentLevelId } = req.body;
    if (isFalsey(unlockLevelId) || isFalsey(dependentLevelId)) return sendResponse(res, 400, { message: 'Required fields are empty' });
    let mappingFound = await LevelUnlockDependencies.findAll({ where: { unlockLevelId, dependentLevelId, deleteFlag: false } });
    if (mappingFound.length > 0) return sendResponse(res, 409, { message: 'Mapping found' });
    await LevelUnlockDependencies.create({ unlockLevelId, dependentLevelId });
    return sendResponse(res, 200, { message: 'Inserted level unlock dependency successfully.' });
  } catch (error) {
    console.log(error);
    return sendErrorResponse(next, 500, error);
  }
};