const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Resource = require('../models/Resource');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

// Cloudinary Configuration (ensure your .env has these)
cloudinary.config({ 
  cloud_name: cloudName, 
  api_key: apiKey, 
  api_secret: apiSecret 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'TNP_Resources',
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });
// Update a resource
router.put('/:id', async (req, res) => {
  try {
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a resource
// server/routes/resourceRoutes.js

// server/routes/resourceRoutes.js

// DELETE: Remove resource from Cloudinary and MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the resource to get the Cloudinary Public ID
    const resource = await Resource.findById(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // 2. Delete the actual file from Cloudinary
    if (resource.cloudinaryId) {
      // Determine if it's 'raw' (PDF) or 'image' (JPG/PNG)
      const resourceType = resource.pdfUrl.includes('/raw/') ? 'raw' : 'image';
      await cloudinary.uploader.destroy(resource.cloudinaryId, { resource_type: resourceType });
    }

    // 3. Delete the record from MongoDB
    await Resource.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Admin Upload Route
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    // Cloudinary 'raw' uploads sometimes don't include the extension in the path
    const finalUrl=req.file.path;

    const newResource = new Resource({
      title: req.body.title,
      category: req.body.category,
      companyName: req.body.companyName,
      pdfUrl: finalUrl, // Storing with .pdf ensures it returns as a PDF
      cloudinaryId: req.file.filename
    });
    
    await newResource.save();
    res.status(201).json({ success: true, message: "Resource Published!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student Get All Route
router.get('/all', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ uploadedAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;