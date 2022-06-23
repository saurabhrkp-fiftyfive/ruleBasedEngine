const express = require('express');
const router = express.Router();
const levelsController = require('../controllers/levels');

router.post('/create', levelsController.createLevel);

router.post('/add-modules-to-level', levelsController.addModulesToLevel);

router.post('/map-demographic-key-level', levelsController.mapDemographicKeyToLevel);

router.post('/map-unlock-level-dependencies', levelsController.mapUnlockLevelDependencies);

module.exports = router;
