const express = require('express');
const hubSpotRoutes = require('./hubSpotRoutes');
const cronRoutes = require('./cronRoutes');
const logRoutes = require('./logRoutes');

const router = express.Router();

// Mount hubSpot routes
router.use('/', hubSpotRoutes);
router.use('/', cronRoutes);
router.use('/', logRoutes);

router.get('/', (req, res) => {
  res.send('Hello, world');
});

module.exports = router;
