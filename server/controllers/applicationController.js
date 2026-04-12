// // const Application = require('../models/Application');
// // const Drive = require('../models/Drive');

// // exports.applyToDrive = async (req, res) => {
// //   // 1. Get data from frontend request
// //   const { driveId, studentId, studentName } = req.body; 
// //   const io = req.app.get('io'); // Get socket.io instance
// //   if (!driveId || !studentId) {
// //     console.error("❌ Missing Data:", req.body);
// //     return res.status(400).json({ message: 'Missing Drive ID or Student ID. Please relogin.' });
// //   }
// //   try {
// //     // 2. Check if student already applied
// //     const existing = await Application.findOne({ driveId, studentId });
// //     if (existing) {
// //       return res.status(400).json({ message: 'You have already applied to this drive' });
// //     }

// //     // 3. Save Application to Database
// //     const newApplication = new Application({
// //       driveId,
// //       studentId,
// //       status: 'applied',
// //       appliedDate: new Date()
// //     });
// //     await newApplication.save();

// //     // 4. Update the Drive's "Total Applicants" count
// //     const drive = await Drive.findByIdAndUpdate(
// //       driveId, 
// //       { $inc: { totalApplicants: 1 } },
// //       { new: true }
// //     );

// //     // 5. --- SEND NOTIFICATION TO ADMINS ---
// //     if (io) {
// //         io.to('admins').emit('adminNotification', {
// //           id: Date.now(),
// //           title: 'New Application Received',
// //           message: `${studentName} applied for ${drive.companyName}`,
// //           type: 'info',
// //           timestamp: new Date(),
// //           read: false
// //         });
// //         console.log(`🔔 Notification sent: ${studentName} -> ${drive.companyName}`);
// //     }

// //     res.status(201).json({ success: true, message: 'Application submitted successfully',
// //       application: newApplication
// //      });

// //   } catch (error) {
// //     console.error("Apply Error:", error);
// //     res.status(500).json({ message: 'Server Error' });
// //   }
// // };


// const Application = require('../models/Application');
// const Drive = require('../models/Drive');

// exports.applyToDrive = async (req, res) => {
//   // 1. Get data from frontend request
//   const { driveId, studentId, studentName } = req.body; 
//   const io = req.app.get('io'); 

//   if (!driveId || !studentId) {
//     console.error("❌ Missing Data:", req.body);
//     return res.status(400).json({ message: 'Missing Drive ID or Student ID. Please relogin.' });
//   }

//   try {
//     // 2. Check if student already applied
//     const existing = await Application.findOne({ driveId, studentId });
//     if (existing) {
//       return res.status(400).json({ message: 'You have already applied to this drive' });
//     }

//     // 3. Update the Drive's "Total Applicants" count FIRST
//     // Doing this first ensures the drive actually exists before creating an application
//     const drive = await Drive.findByIdAndUpdate(
//       driveId, 
//       { $inc: { totalApplicants: 1 } },
//       { new: true }
//     );

//     // 🛡️ SAFETY CHECK: If drive is null, it means the ID is invalid or the drive was deleted
//     if (!drive) {
//       return res.status(404).json({ message: 'Error: Drive not found. It may have been deleted.' });
//     }

//     // 4. Save Application to Database
//     const newApplication = new Application({
//       driveId,
//       studentId,
//       status: 'applied',
//       appliedDate: new Date()
//     });
//     await newApplication.save();

//     // 5. Send Notification to Admins
//     if (io) {
//         io.to('admins').emit('adminNotification', {
//           id: Date.now(),
//           title: 'New Application Received',
//           message: `${studentName} applied for ${drive.companyName}`,
//           type: 'info',
//           timestamp: new Date(),
//           read: false
//         });
//         console.log(`🔔 Notification sent: ${studentName} -> ${drive.companyName}`);
//     }

//     res.status(201).json({ 
//       success: true, 
//       message: 'Application submitted successfully',
//       application: newApplication
//     });

//   } catch (error) {
//     console.error("❌ Apply Error:", error);
    
//     // 🛡️ SAFETY CHECK: Handle Mongoose CastErrors (invalid ID formats) gracefully
//     if (error.name === 'CastError') {
//       return res.status(400).json({ message: 'Invalid ID format provided.' });
//     }

//     res.status(500).json({ message: 'Server Error' });
//   }
// };


const Application = require('../models/Application');
const Drive = require('../models/Drive');

exports.applyToDrive = async (req, res) => {
  console.log("---- STARTING APPLICATION PROCESS ----");
  console.log("1. Data received from React:", req.body);

  const { driveId, studentId, studentName } = req.body; 
  const io = req.app.get('io'); 

  if (!driveId || !studentId) {
    console.log("❌ Failed: Missing IDs in request.");
    return res.status(400).json({ message: 'Missing Drive ID or Student ID. Please relogin.' });
  }

  try {
    console.log("2. Checking if student already applied...");
    const existing = await Application.findOne({ driveId, studentId });
    if (existing) {
      console.log("❌ Failed: Student already applied.");
      return res.status(400).json({ message: 'You have already applied to this drive' });
    }

    console.log(`3. Searching for Drive ID: ${driveId}...`);
    // NOTE: We do this BEFORE creating the application!
    const drive = await Drive.findByIdAndUpdate(
      driveId, 
      { $inc: { totalApplicants: 1 } },
      { new: true }
    );

    // 🛡️ CRITICAL FIX: If the drive doesn't exist, stop here!
    if (!drive) {
      console.log("❌ FATAL ERROR: The Drive ID does not exist in the database! (Ghost ID)");
      return res.status(404).json({ message: 'Drive not found. Please refresh your page.' });
    }
    
    console.log(`✅ Drive found: ${drive.companyName}. Saving application...`);

    // 4. Save Application to Database
    const newApplication = new Application({
      driveId,
      studentId,
      status: 'applied',
      appliedDate: new Date()
    });
    await newApplication.save();
    console.log("✅ Application successfully saved to database!");

    // 5. Send Notification
    if (io) {
        // Send confirmation to the student who applied
        io.to(studentId).emit('notification', {
          id: Date.now(),
          title: 'Application Submitted',
          message: `You have successfully applied to ${drive.companyName}!`,
          type: 'success',
          timestamp: new Date()
        });

        // Send notification to admins about new application
        io.to('admins').emit('adminNotification', {
          id: Date.now(),
          title: 'New Application Received',
          message: `${studentName} applied for ${drive.companyName}`,
          type: 'info',
          timestamp: new Date(),
          read: false
        });
        console.log(`🔔 Notifications sent to student and admins for ${drive.companyName}`);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully',
      application: {
        ...newApplication.toObject(),
        _id: newApplication._id,
        id: newApplication._id.toString(),
        companyName: drive.companyName,
        companyLogo: drive.companyLogo || '',
        role: drive.role,
        package: drive.package,
        location: drive.location || '',
        appliedDate: newApplication.appliedDate
      }
    });

  } catch (error) {
    console.error("🔥 FATAL SERVER CRASH:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format provided.' });
    }

    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// Get User's Applications with Drive Details
exports.getUserApplications = async (req, res) => {
  try {
    // Get studentId from JWT token (set by authMiddleware)
    const studentId = req.user?.id || req.user?._id;

    if (!studentId) {
      console.error("❌ No student ID found in token");
      return res.status(401).json({ message: 'Unauthorized: No user ID in token' });
    }

    console.log(`📥 Fetching applications for student: ${studentId}`);

    // Find all applications for this student and populate drive details
    const applications = await Application.find({ studentId })
      .populate('driveId', 'companyName role location package status')
      .sort({ appliedDate: -1 });

    console.log(`✅ Found ${applications.length} applications`);

    res.json({
      success: true,
      applications: applications.map(app => ({
        _id: app._id,
        id: app._id.toString(),
        status: app.status,
        appliedDate: app.appliedDate,
        driveId: {
          _id: app.driveId?._id,
          companyName: app.driveId?.companyName || 'Unknown',
          role: app.driveId?.role || 'N/A',
          location: app.driveId?.location,
          package: app.driveId?.package,
          status: app.driveId?.status
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Get applications for a specific drive (Admin)
exports.getApplicationsByDrive = async (req, res) => {
  try {
    const { driveId } = req.params;

    const applications = await Application.find({ driveId })
      .populate('studentId', 'name email department year')
      .populate('driveId', 'companyName role')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      applications: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['applied', 'screening', 'shortlisted', 'interview', 'selected', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    ).populate('driveId', 'companyName role')
      .populate('studentId', 'name email');

    res.json({
      success: true,
      message: 'Application status updated',
      application: application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Failed to update application' });
  }
};

// Check if student applied to a drive
exports.checkApplication = async (req, res) => {
  try {
    const { driveId } = req.params;
    const studentId = req.user.id;

    const application = await Application.findOne({ driveId, studentId });

    res.json({
      success: true,
      applied: !!application,
      application: application
    });
  } catch (error) {
    console.error('Error checking application:', error);
    res.status(500).json({ message: 'Failed to check application' });
  }
};