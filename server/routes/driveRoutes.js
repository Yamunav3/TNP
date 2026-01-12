
const express = require('express');
const router = express.Router();
// This import works ONLY if the file above (step 4) exists
const driveController = require('../controllers/driveController');

router.get('/', driveController.getAllDrives);
router.post('/', driveController.createDrive);
router.delete('/:id', driveController.deleteDrive);

module.exports = router;