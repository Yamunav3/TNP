const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path points to your User model
const mongoose = require('mongoose');
// @route   GET /api/admin/students
// @desc    Get all students

const adminController = require('../controllers/adminController');
router.get('/students', async (req, res) => {
  try {
    console.log('📥 GET /api/admin/students - Fetching all students...');
    // Fetch all users where role is 'student', excluding their passwords
    const students = await User.find({ role: 'student' }).select('-password');
    console.log(`✅ Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error('❌ Admin Students Error:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Server Error fetching students', error: error.message });
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

      // 2. Join with Applications (using correct field: studentId, not userId)
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'studentId',
          as: 'applications'
        }
      },

      // 2b. Join with Drives for each application
      {
        $lookup: {
          from: 'drives',
          localField: 'applications.driveId',
          foreignField: '_id',
          as: 'drives'
        }
      },

      // 3. Project specific fields (exclude password)
      {
        $project: {
          name: 1,
          email: 1,
          department: 1,
          year: 1,
          cgpa: 1,
          backlogs: 1,
          applications: {
            $map: {
              input: '$applications',
              as: 'app',
              in: {
                driveId: '$$app.driveId',
                status: '$$app.status',
                appliedDate: '$$app.appliedDate'
              }
            }
          },
          drives: {
            $map: {
              input: '$drives',
              as: 'drive',
              in: {
                companyName: '$$drive.companyName',
                role: '$$drive.role',
                package: '$$drive.package'
              }
            }
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