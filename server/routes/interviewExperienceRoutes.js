const express = require('express');
const {
    getExperiences,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
    toggleUpvote,
    getAllExperiencesAdmin
} = require('../controllers/interviewExperienceController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(getExperiences)
    .post(protect, createExperience);

router.route('/admin/all')
    .get(protect, admin, getAllExperiencesAdmin);

router.route('/:id')
    .get(getExperienceById)
    .put(protect, updateExperience)
    .delete(protect, deleteExperience);

router.route('/:id/upvote')
    .put(protect, toggleUpvote);

module.exports = router;
