const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// --- STUDENT ROUTES ---
// Add manual interview schedule
router.post('/add-manual', protect, interviewController.addManualInterviewSchedule);

// Get student's interview schedules
router.get('/my-interviews', protect, interviewController.getStudentInterviews);

// Get upcoming interviews for dashboard
router.get('/upcoming', protect, interviewController.getUpcomingInterviews);

// --- ADMIN ROUTES ---
// Create interview schedules for multiple students (automatic)
router.post('/create-bulk', protect, interviewController.createInterviewScheduleForStudents);

// Get interviews for a specific drive
router.get('/drive/:driveId', protect, interviewController.getDriveInterviews);

// Update interview schedule
router.put('/:id', protect, interviewController.updateInterviewSchedule);

// Cancel interview schedule
router.patch('/:id/cancel', protect, interviewController.cancelInterviewSchedule);

// Mark interview as completed
router.patch('/:id/complete', protect, interviewController.completeInterview);

// Delete interview schedule
router.delete('/:id', protect, interviewController.deleteInterviewSchedule);

module.exports = router;
