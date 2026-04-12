const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

// --- STUDENT ROUTES ---
// Add manual interview schedule
router.post('/add-manual', authMiddleware, interviewController.addManualInterviewSchedule);

// Get student's interview schedules
router.get('/my-interviews', authMiddleware, interviewController.getStudentInterviews);

// Get upcoming interviews for dashboard
router.get('/upcoming', authMiddleware, interviewController.getUpcomingInterviews);

// --- ADMIN ROUTES ---
// Create interview schedules for multiple students (automatic)
router.post('/create-bulk', authMiddleware, interviewController.createInterviewScheduleForStudents);

// Get interviews for a specific drive
router.get('/drive/:driveId', authMiddleware, interviewController.getDriveInterviews);

// Update interview schedule
router.put('/:id', authMiddleware, interviewController.updateInterviewSchedule);

// Cancel interview schedule
router.patch('/:id/cancel', authMiddleware, interviewController.cancelInterviewSchedule);

// Mark interview as completed
router.patch('/:id/complete', authMiddleware, interviewController.completeInterview);

// Delete interview schedule
router.delete('/:id', authMiddleware, interviewController.deleteInterviewSchedule);

module.exports = router;
