const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path points to your User model
const mongoose = require('mongoose');
// @route   GET /api/admin/students
// @desc    Get all students

const adminController = require('../controllers/adminController');
router.get('/students', async (req, res) => {
  try {
    // Fetch all users where role is 'student', excluding their passwords
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching students' });
  }
});

router.get('/dashboard-stats', adminController.getDashboardStats)

// @route   GET /api/admin/students/:id
// @desc    Get single student details with full application history
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.aggregate([
      // 1. Find the specific student
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

      // 2. Join with Applications
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'userId',
          as: 'applications'
        }
      },

      // 3. Project specific fields (exclude password)
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          department: 1,
          year: 1,
          cgpa: 1,
          backlogs: 1,
          rollNumber: 1, // Assuming you have this field, or use _id
          applications: {
            companyName: 1,
            role: 1,
            status: 1,
            appliedDate: 1,
            package: 1
          }
        }
      }
    ]);

    if (!student || student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// @route   DELETE /api/admin/students/:id
// @desc    Delete a student
router.delete('/students/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student' });
    }
});

module.exports = router;