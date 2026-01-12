const express = require('express');
const router = express.Router();
// This must match the file you created in Step 1
const applicationController = require('../controllers/applicationController');

router.post('/apply', applicationController.applyToDrive);

module.exports = router;