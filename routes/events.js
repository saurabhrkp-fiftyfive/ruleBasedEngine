const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events');

router.post('/challenge-completion', eventsController.challengeCompletion);

module.exports = router;
