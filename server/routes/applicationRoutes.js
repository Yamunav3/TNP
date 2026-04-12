const express = require('express');
const router = express.Router();
// This must match the file you created in Step 1
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user's applications (requires authentication)
router.get('/my-applications', authMiddleware, applicationController.getUserApplications);

// Submit new application (requires authentication)
router.post('/apply', authMiddleware, applicationController.applyToDrive);

module.exports = router;