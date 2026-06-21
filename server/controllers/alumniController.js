const Alumni = require('../models/Alumni');
const MentorshipRequest = require('../models/MentorshipRequest');

// Get all alumni (for students)
const getAlumni = async (req, res) => {
    try {
        const { company, branch, search } = req.query;
        let filter = { isAvailableForMentorship: true };

        if (company) filter.company = { $regex: company, $options: 'i' };
        if (branch) filter.branch = branch;
        if (search) {
            filter.$or = [
                { company: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const alumni = await Alumni.find(filter).sort({ rating: -1 });
        // Map to frontend fields
        const mappedAlumni = alumni.map(a => ({
            ...a._doc,
            graduationYear: a.yearOfGraduation,
            linkedin: a.linkedinUrl,
            github: a.githubUrl,
            isAvailable: a.isAvailableForMentorship
        }));
        
        res.status(200).json(mappedAlumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching alumni' });
    }
};

const getAlumniById = async (req, res) => {
    try {
        const { id } = req.params;
        const alumni = await Alumni.findById(id)
            .populate('user', 'name email');

        if (!alumni) {
            return res.status(404).json({ message: 'Alumni not found' });
        }

        res.status(200).json(alumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching alumni' });
    }
};

const createAlumni = async (req, res) => {
    try {
        const { 
            name, 
            company, 
            role, 
            graduationYear, 
            branch, 
            skills, 
            linkedin, 
            github, 
            isAvailable 
        } = req.body;
        
        const alumni = await Alumni.create({
            name,
            company,
            role,
            yearOfGraduation: graduationYear,
            branch,
            skills,
            linkedinUrl: linkedin,
            githubUrl: github,
            isAvailableForMentorship: isAvailable
        });
        
        res.status(201).json(alumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating alumni profile' });
    }
};

const updateAlumni = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, 
            company, 
            role, 
            graduationYear, 
            branch, 
            skills, 
            linkedin, 
            github, 
            isAvailable 
        } = req.body;
        
        const alumni = await Alumni.findByIdAndUpdate(
            id,
            {
                name,
                company,
                role,
                yearOfGraduation: graduationYear,
                branch,
                skills,
                linkedinUrl: linkedin,
                githubUrl: github,
                isAvailableForMentorship: isAvailable
            },
            { new: true }
        );
        
        if (!alumni) {
            return res.status(404).json({ message: 'Alumni not found' });
        }
        
        res.status(200).json(alumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating alumni' });
    }
};

const deleteAlumni = async (req, res) => {
    try {
        const { id } = req.params;
        await Alumni.findByIdAndDelete(id);
        res.status(200).json({ message: 'Alumni deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting alumni' });
    }
};

// -- Mentorship Requests --
const getMentorshipRequests = async (req, res) => {
    try {
        const { type } = req.query;
        let filter = {};

        if (type === 'sent') filter.student = req.user._id;
        if (type === 'received') filter.alumni = req.params.alumniId;

        const requests = await MentorshipRequest.find(filter)
            .populate('student', 'name email')
            .populate('alumni', 'user company role')
            .sort({ createdAt: -1 });
        
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching mentorship requests' });
    }
};

const createMentorshipRequest = async (req, res) => {
    try {
        const { alumni, ...rest } = req.body;
        const userId = req.user._id;
        
        const request = await MentorshipRequest.create({
            ...rest,
            student: userId,
            alumni
        });
        
        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending mentorship request' });
    }
};

const updateMentorshipRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await MentorshipRequest.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating request' });
    }
};

// Get all alumni (admin)
const getAllAlumniAdmin = async (req, res) => {
    try {
        const alumni = await Alumni.find().sort({ createdAt: -1 });
        // Map to frontend fields
        const mappedAlumni = alumni.map(a => ({
            ...a._doc,
            graduationYear: a.yearOfGraduation,
            linkedin: a.linkedinUrl,
            github: a.githubUrl,
            isAvailable: a.isAvailableForMentorship
        }));
        
        res.status(200).json(mappedAlumni);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all alumni' });
    }
};

module.exports = {
    getAlumni,
    getAlumniById,
    createAlumni,
    updateAlumni,
    deleteAlumni,
    getMentorshipRequests,
    createMentorshipRequest,
    updateMentorshipRequest,
    getAllAlumniAdmin
};
