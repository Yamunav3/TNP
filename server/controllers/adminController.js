
const mongoose = require('mongoose');
const User = require('../models/User');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

const buildFallbackDashboardStats = () => ({
  stats: {
    totalStudents: 0,
    companiesOnboarded: 0,
    activeDrives: 0,
    avgPackage: '₹0 LPA',
    studentTrend: 0,
    companyTrend: 0,
    drivesTrend: 0,
    packageTrend: 0,
  },
  placementTrend: [{ month: 'Jan', placed: 0 }],
  departmentData: [{ name: 'No Data', value: 1, color: '#e2e8f0' }],
  recentActivity: [],
  upcomingDrives: [],
});

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📥 GET /api/admin/dashboard-stats - Fetching dashboard stats...');

    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB is not connected. Returning fallback dashboard stats.');
      return res.json(buildFallbackDashboardStats());
    }

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // ==========================================
    // 1. STUDENT TREND (This Month vs Last Month)
    // ==========================================
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Students registered this month
    const studentsThisMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: firstDayCurrentMonth }
    });

    // Students registered last month (for comparison)
    const studentsLastMonth = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayCurrentMonth }
    });

    // Calculate Percentage Change
    let studentTrend = 0;
    if (studentsLastMonth > 0) {
      studentTrend = ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100;
    } else if (studentsThisMonth > 0) {
      studentTrend = 100; // 100% growth if starting from 0
    }
    
    // ==========================================
    // 2. AVERAGE PACKAGE CALCULATION
    // ==========================================
    // Find all applications where student was 'selected'
    const placedApplications = await Application.find({ status: 'selected' }).populate('driveId', 'package');
    
    let totalPackage = 0;
    let placedCount = placedApplications.length;

    placedApplications.forEach(app => {
      if (app.driveId && app.driveId.package) {
        // Extract number from string (e.g., "24 LPA" -> 24)
        const match = app.driveId.package.match(/(\d+(\.\d+)?)/);
        if (match) {
          totalPackage += parseFloat(match[0]);
        }
      }
    });

    const avgPackageValue = placedCount > 0 ? (totalPackage / placedCount).toFixed(1) : 0;
    const avgPackage = `₹${avgPackageValue} LPA`;

    // ==========================================
    // 3. DEPARTMENT WISE PLACEMENTS
    // ==========================================
    // Aggregate placed students by department
    // We first find selected apps, then look up the student details
    const deptStats = await Application.aggregate([
      { $match: { status: 'selected' } },
      {
        $lookup: {
          from: 'users', // Collection name usually lowercase plural
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.department', // Group by Department
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for Frontend (Pie Chart)
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const departmentData = deptStats.map((dept, index) => ({
      name: dept._id || 'Unknown',
      value: dept.count,
      color: colors[index % colors.length]
    }));

    // If no data, provide empty state
    if (departmentData.length === 0) {
      departmentData.push({ name: 'No Data', value: 1, color: '#e2e8f0' });
    }

    // ==========================================
    // 4. OTHER DATA (Companies & Drives)
    // ==========================================
    const companiesOnboarded = (await Drive.distinct('companyName')).length;
    const activeDrives = await Drive.countDocuments({ deadline: { $gte: now } });

    // Recent Activity Log
    const recentApps = await Application.find()
      .sort({ appliedDate: -1 })
      .limit(5)
      .populate('driveId', 'companyName')
      .populate('studentId', 'name');

    const recentActivity = recentApps.map(app => ({
      action: `${app.studentId?.name || 'Student'} applied for ${app.driveId?.companyName || 'Company'}`,
      time: new Date(app.appliedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'application'
    }));

    // Upcoming Drives
    const upcomingDrivesRaw = await Drive.find({ deadline: { $gte: now } })
      .sort({ deadline: 1 })
      .limit(4);

    const upcomingDrives = upcomingDrivesRaw.map(d => ({
      company: d.companyName,
      date: new Date(d.deadline).toLocaleDateString(),
      slots: d.totalApplicants
    }));

    // Mock Placement Trend (Requires complex monthly aggregation, kept simplified for now)
    const placementTrend = [
      { month: 'Jan', placed: placedCount } // You can expand this logic similarly to studentTrend
    ];

    res.json({
      stats: {
        totalStudents,
        companiesOnboarded,
        activeDrives,
        avgPackage,
        studentTrend: parseFloat(studentTrend.toFixed(1)),
        companyTrend: 0, // Implement similarly if needed
        drivesTrend: 0,
        packageTrend: 0
      },
      placementTrend,
      departmentData,
      recentActivity,
      upcomingDrives
    });

  } catch (error) {
    console.error("❌ Dashboard Stats Error:", error.message);
    console.error(error.stack);
    res.json(buildFallbackDashboardStats());
  }
};