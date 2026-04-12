
// const Drive = require('../models/Drive');
// const Application = require('../models/Application');

// // --- GET ALL DRIVES ---
// exports.getAllDrives = async (req, res) => {
//   try {
//     // Sort by newest posted date first
//     const drives = await Drive.find().sort({ postedDate: -1 });
//     res.status(200).json(drives);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- CREATE NEW DRIVE ---
// exports.createDrive = async (req, res) => {
//   try {
//     const newDrive = new Drive(req.body);
//     const savedDrive = await newDrive.save();
//     res.status(201).json(savedDrive);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // --- DELETE DRIVE ---
// exports.deleteDrive = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Delete the Drive from 'drives' collection
//     const deletedDrive = await Drive.findByIdAndDelete(id);

//     if (!deletedDrive) {
//       return res.status(404).json({ success: false, message: 'Drive not found' });
//     }

//     // 2. Cascade Delete: Remove all student applications for this drive
//     // This prevents "orphan" applications from showing up on student dashboards
//     if (Application) {
//       await Application.deleteMany({ driveId: id });
//     }

//     res.status(200).json({ success: true, message: 'Drive and related applications deleted' });
//   } catch (error) {
//     console.error("Delete Error:", error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };


const Drive = require('../models/Drive');
const Application = require('../models/Application');

// --- GET ALL DRIVES ---
exports.getAllDrives = async (req, res) => {
  try {
    // Sort by newest posted date first
    const drives = await Drive.find().sort({ postedDate: -1 });
    res.status(200).json(drives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CREATE NEW DRIVE ---
exports.createDrive = async (req, res) => {
  try {
    const newDrive = new Drive(req.body);
    const savedDrive = await newDrive.save();

    // 🔴 --- WEBSOCKET NOTIFICATION LOGIC --- 🔴
    // Grab the socket instance we set in server.js
    const io = req.app.get('io'); 
    
    if (io) {
      // Use io.emit to broadcast this event to EVERYONE connected (Students)
      io.emit('newJobPosted', {
        id: Date.now(),
        title: 'New Job Drive Posted!',
        message: `${savedDrive.companyName} is now hiring for ${savedDrive.role}.`,
        type: 'job',
        timestamp: new Date(),
        read: false,
        driveId: savedDrive._id
      });
      console.log(`📣 Broadcasted new job notification for: ${savedDrive.companyName}`);
    }
    // ------------------------------------------

    res.status(201).json(savedDrive);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- DELETE DRIVE ---
exports.deleteDrive = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete the Drive from 'drives' collection
    const deletedDrive = await Drive.findByIdAndDelete(id);

    if (!deletedDrive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // 2. Cascade Delete: Remove all student applications for this drive
    // This prevents "orphan" applications from showing up on student dashboards
    if (Application) {
      await Application.deleteMany({ driveId: id });
    }

    res.status(200).json({ success: true, message: 'Drive and related applications deleted' });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};