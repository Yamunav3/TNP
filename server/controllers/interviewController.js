const InterviewSchedule = require('../models/InterviewSchedule');
const Application = require('../models/Application');
const User = require('../models/User');
const Drive = require('../models/Drive');
const { sendInterviewScheduleEmail, sendInterviewCancellationEmail } = require('../services/emailService');

// --- 1. STUDENT: ADD MANUAL INTERVIEW SCHEDULE ---
exports.addManualInterviewSchedule = async (req, res) => {
  try {
    const { applicationId, interviewDate, interviewTime, interviewType, location, interviewLink, round, description } = req.body;
    const studentId = req.user.id; // From auth middleware

    // Find the application
    const application = await Application.findById(applicationId).populate('driveId studentId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify student owns this application
    if (application.studentId._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Not authorized to schedule for this application' });
    }

    // Create interview schedule
    const schedule = new InterviewSchedule({
      applicationId,
      studentId,
      driveId: application.driveId._id,
      companyName: application.driveId.companyName,
      role: application.driveId.role,
      round,
      interviewType,
      interviewDate,
      interviewTime,
      location,
      interviewLink,
      description,
      scheduledBy: 'manual',
      status: 'scheduled'
    });

    await schedule.save();

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      schedule
    });
  } catch (error) {
    console.error('Error adding interview schedule:', error);
    res.status(500).json({ message: 'Failed to schedule interview' });
  }
};

// --- 2. ADMIN: CREATE INTERVIEW SCHEDULE FOR STUDENTS (AUTOMATIC) ---
exports.createInterviewScheduleForStudents = async (req, res) => {
  try {
    const { driveId, studentIds, round, interviewDate, interviewTime, interviewType, location, interviewLink, interviewer, interviewerEmail, description } = req.body;

    if (!driveId || !studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const schedules = [];
    const emailLogs = [];

    for (const studentId of studentIds) {
      // Find student's application for this drive
      const application = await Application.findOne({ driveId, studentId }).populate('studentId');
      if (!application) {
        console.log(`No application found for student ${studentId} in drive ${driveId}`);
        continue;
      }

      // Create interview schedule
      const schedule = new InterviewSchedule({
        applicationId: application._id,
        studentId,
        driveId,
        companyName: drive.companyName,
        role: drive.role,
        round,
        interviewType,
        interviewDate,
        interviewTime,
        location,
        interviewLink,
        interviewer,
        interviewerEmail,
        description,
        scheduledBy: 'automatic',
        status: 'scheduled'
      });

      await schedule.save();
      schedules.push(schedule);

      // Send email to student
      const student = application.studentId;
      const emailSent = await sendInterviewScheduleEmail(
        student.email,
        student.name,
        {
          companyName: drive.companyName,
          role: drive.role,
          round,
          interviewDate,
          interviewTime,
          interviewLink,
          location,
          interviewType
        }
      );

      if (emailSent) {
        schedule.emailSent = true;
        schedule.emailSentAt = new Date();
        await schedule.save();
        emailLogs.push({ studentEmail: student.email, sent: true });
      } else {
        emailLogs.push({ studentEmail: student.email, sent: false });
      }
    }

    // Notify admin via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('adminNotification', {
        id: Date.now(),
        title: 'Interview Schedules Created',
        message: `${schedules.length} interview schedules created for ${drive.companyName}`,
        type: 'success',
        timestamp: new Date(),
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: `${schedules.length} interview schedules created`,
      schedulesCount: schedules.length,
      emailsCount: emailLogs.filter(e => e.sent).length,
      emailLogs
    });
  } catch (error) {
    console.error('Error creating interview schedules:', error);
    res.status(500).json({ message: 'Failed to create interview schedules' });
  }
};

// --- 3. GET STUDENT'S INTERVIEW SCHEDULES ---
exports.getStudentInterviews = async (req, res) => {
  try {
    const studentId = req.user.id;

    const schedules = await InterviewSchedule.find({ studentId })
      .populate('driveId', 'companyName role location')
      .sort({ interviewDate: 1 });

    res.json({
      success: true,
      interviews: schedules
    });
  } catch (error) {
    console.error('Error fetching student interviews:', error);
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
};

// --- 4. GET INTERVIEWS FOR A SPECIFIC DRIVE (ADMIN) ---
exports.getDriveInterviews = async (req, res) => {
  try {
    const { driveId } = req.params;

    const schedules = await InterviewSchedule.find({ driveId })
      .populate('studentId', 'name email')
      .populate('driveId', 'companyName role')
      .sort({ interviewDate: 1 });

    res.json({
      success: true,
      interviews: schedules
    });
  } catch (error) {
    console.error('Error fetching drive interviews:', error);
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
};

// --- 5. UPDATE INTERVIEW SCHEDULE ---
exports.updateInterviewSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime, location, interviewLink, round, status, outcome, remarks } = req.body;

    const schedule = await InterviewSchedule.findByIdAndUpdate(
      id,
      {
        interviewDate,
        interviewTime,
        location,
        interviewLink,
        round,
        status,
        outcome,
        remarks,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Interview schedule not found' });
    }

    res.json({
      success: true,
      message: 'Interview schedule updated',
      schedule
    });
  } catch (error) {
    console.error('Error updating interview schedule:', error);
    res.status(500).json({ message: 'Failed to update interview schedule' });
  }
};

// --- 6. CANCEL INTERVIEW SCHEDULE ---
exports.cancelInterviewSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await InterviewSchedule.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    ).populate('studentId', 'email name');

    if (!schedule) {
      return res.status(404).json({ message: 'Interview schedule not found' });
    }

    // Send cancellation email
    const emailSent = await sendInterviewCancellationEmail(
      schedule.studentId.email,
      schedule.studentId.name,
      {
        companyName: schedule.companyName,
        role: schedule.role,
        round: schedule.round,
        interviewDate: schedule.interviewDate
      }
    );

    res.json({
      success: true,
      message: 'Interview schedule cancelled',
      emailSent,
      schedule
    });
  } catch (error) {
    console.error('Error cancelling interview schedule:', error);
    res.status(500).json({ message: 'Failed to cancel interview schedule' });
  }
};

// --- 7. DELETE INTERVIEW SCHEDULE ---
exports.deleteInterviewSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    await InterviewSchedule.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Interview schedule deleted'
    });
  } catch (error) {
    console.error('Error deleting interview schedule:', error);
    res.status(500).json({ message: 'Failed to delete interview schedule' });
  }
};

// --- 8. GET ALL UPCOMING INTERVIEWS (FOR DASHBOARD) ---
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const studentId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await InterviewSchedule.find({
      studentId,
      interviewDate: { $gte: today },
      status: { $in: ['scheduled', 'rescheduled'] }
    })
      .populate('driveId', 'companyName role companyLogo')
      .sort({ interviewDate: 1 });

    res.json({
      success: true,
      interviews: schedules
    });
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming interviews' });
  }
};

// --- 9. MARK INTERVIEW AS COMPLETED ---
exports.completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, remarks } = req.body;

    const schedule = await InterviewSchedule.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        outcome,
        remarks,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Interview schedule not found' });
    }

    // Update application status if user was selected
    if (outcome === 'selected') {
      await Application.findByIdAndUpdate(schedule.applicationId, {
        status: 'selected'
      });
    }

    res.json({
      success: true,
      message: 'Interview marked as completed',
      schedule
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ message: 'Failed to complete interview' });
  }
};
