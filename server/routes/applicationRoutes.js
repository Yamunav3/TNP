const express = require('express');
const router = express.Router();
// This must match the file you created in Step 1
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Get user's applications (requires authentication)
router.get('/my-applications', protect, applicationController.getUserApplications);

// Submit new application (requires authentication)
router.post('/apply', protect, applicationController.applyToDrive);

module.exports = router;