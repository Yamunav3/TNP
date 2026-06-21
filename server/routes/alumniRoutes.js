const express = require('express');
const {
    getAlumni,
    getAlumniById,
    createAlumni,
    updateAlumni,
    deleteAlumni,
    getMentorshipRequests,
    createMentorshipRequest,
    updateMentorshipRequest,
    getAllAlumniAdmin
} = require('../controllers/alumniController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Alumni CRUD
router.route('/')
    .get(getAlumni)
    .post(protect, admin, createAlumni);

router.route('/admin/all')
    .get(protect, admin, getAllAlumniAdmin);

router.route('/:id')
    .get(getAlumniById)
    .put(protect, admin, updateAlumni)
    .delete(protect, admin, deleteAlumni);

// Mentorship Requests
router.route('/mentorship/requests')
    .get(protect, getMentorshipRequests)
    .post(protect, createMentorshipRequest);

router.route('/mentorship/requests/:id')
    .put(protect, updateMentorshipRequest);

module.exports = router;
