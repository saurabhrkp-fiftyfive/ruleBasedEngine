const express = require('express');
const router = express.Router();
const levelsController = require('../controllers/levels');

router.post('/create', levelsController.createLevel);

module.exports = router;
