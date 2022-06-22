const express = require('express');
const router = express.Router();
const indexController = require('../controllers');

router.get('/', (req, res) => res.send('Silence is golden'));

router.post('/challenge-completion', indexController.challengeCompletion);

module.exports = router;
