


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

    // ------------------------------------------

  exports.createDrive = async (req, res) => {
  try {
    console.log("📥 Received Drive Data:", req.body); // Check your terminal for this!
    const newDrive = new Drive(req.body);
    const savedDrive = await newDrive.save();
    
    // ... (rest of your WebSocket logic)
    
    res.status(201).json(savedDrive);
  } catch (error) {
    // FIX: Send the detailed Mongoose error back to the frontend for debugging
    console.error("❌ Validation Error:", error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message, 
      errors: error.errors // This tells you exactly which field failed
    });
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