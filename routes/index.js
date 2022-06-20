const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('Silence is golden'));

module.exports = router;
