const InterviewExperience = require('../models/InterviewExperience');

const getExperiences = async (req, res) => {
    try {
        const { company, search } = req.query;
        let filter = { status: 'Approved' };
        
        if (company) filter.company = { $regex: company, $options: 'i' };
        if (search) {
            filter.$or = [
                { company: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } },
            ];
        }

        const experiences = await InterviewExperience.find(filter)
            .populate('student', 'name department year')
            .sort({ createdAt: -1 });

        res.status(200).json(experiences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching interview experiences' });
    }
};

const getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        const experience = await InterviewExperience.findById(id)
            .populate('student', 'name department year');
        
        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        experience.views += 1;
        await experience.save();
        res.status(200).json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching experience' });
    }
};

const createExperience = async (req, res) => {
    try {
        const { student, ...rest } = req.body;
        const userId = req.user._id;
        
        const experience = await InterviewExperience.create({
            ...rest,
            student: userId
        });
        res.status(201).json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating experience' });
    }
};

const updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...updates } = req.body;

        // Only allow admins to update status
        const updateData = req.user.role === 'admin' ? req.body : updates;
        const experience = await InterviewExperience.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating experience' });
    }
};

const deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;
        await InterviewExperience.findByIdAndDelete(id);
        res.status(200).json({ message: 'Experience deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting experience' });
    }
};

const toggleUpvote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const experience = await InterviewExperience.findById(id);
        
        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        const upvoteIndex = experience.upvotes.indexOf(userId);
        
        if (upvoteIndex === -1) {
            experience.upvotes.push(userId);
        } else {
            experience.upvotes.splice(upvoteIndex, 1);
        }

        await experience.save();
        res.status(200).json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error upvoting experience' });
    }
};

const getAllExperiencesAdmin = async (req, res) => {
    try {
        const experiences = await InterviewExperience.find()
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json(experiences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all experiences' });
    }
};

module.exports = {
    getExperiences,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience,
    toggleUpvote,
    getAllExperiencesAdmin
};
