const express = require('express');
const router = express.Router();

const voters = require('../controllers/voters.controller');

router.get('/voters', voters.loadAll);
router.post('/voters', voters.vote);

module.exports = router;
