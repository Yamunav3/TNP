const Application = require('../models/Application');
const Drive = require('../models/Drive');

exports.applyToDrive = async (req, res) => {
  // 1. Get data from frontend request
  const { driveId, studentId, studentName } = req.body; 
  const io = req.app.get('io'); // Get socket.io instance
  if (!driveId || !studentId) {
    console.error("❌ Missing Data:", req.body);
    return res.status(400).json({ message: 'Missing Drive ID or Student ID. Please relogin.' });
  }
  try {
    // 2. Check if student already applied
    const existing = await Application.findOne({ driveId, studentId });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this drive' });
    }

    // 3. Save Application to Database
    const newApplication = new Application({
      driveId,
      studentId,
      status: 'applied',
      appliedDate: new Date()
    });
    await newApplication.save();

    // 4. Update the Drive's "Total Applicants" count
    const drive = await Drive.findByIdAndUpdate(
      driveId, 
      { $inc: { totalApplicants: 1 } },
      { new: true }
    );

    // 5. --- SEND NOTIFICATION TO ADMINS ---
    if (io) {
        io.to('admins').emit('adminNotification', {
          id: Date.now(),
          title: 'New Application Received',
          message: `${studentName} applied for ${drive.companyName}`,
          type: 'info',
          timestamp: new Date(),
          read: false
        });
        console.log(`🔔 Notification sent: ${studentName} -> ${drive.companyName}`);
    }

    res.status(201).json({ success: true, message: 'Application submitted successfully',
      application: newApplication
     });

  } catch (error) {
    console.error("Apply Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};