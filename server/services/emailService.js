const sendEmail = require('../utils/sendEmail');

// Test Brevo API connection
console.log('✅ Brevo Email Service Initialized');

// Send interview schedule notification to student
const sendInterviewScheduleEmail = async (studentEmail, studentName, interviewData) => {
  try {
    const { companyName, role, round, interviewDate, interviewTime, interviewLink, location, interviewType } = interviewData;
    
    const formattedDate = new Date(interviewDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const locationInfo = interviewType === 'online' 
      ? `<a href="${interviewLink}" style="color: #0066cc; text-decoration: none;">Join Video Call</a>`
      : `Location: ${location}`;

    const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Interview Scheduled! 🎉</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hi <strong>${studentName}</strong>,</p>
        
        <p>Great news! Your interview has been scheduled. Here are the details:</p>
        
        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px;">
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Position:</strong> ${role}</p>
          <p><strong>Round:</strong> ${round}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${interviewTime}</p>
          <p><strong>Type:</strong> ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}</p>
          <p><strong>${interviewType === 'online' ? 'Meeting Link' : 'Venue'}:</strong> ${locationInfo}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #ffc107;">
          <strong>Important:</strong>
          <ul>
            <li>Be online 5-10 minutes before the scheduled time</li>
            <li>Ensure you have a stable internet connection (for online interviews)</li>
            <li>Have all required documents ready</li>
            <li>Dress professionally</li>
          </ul>
        </div>
        
        <p>If you have any questions or need to reschedule, please contact our placement team.</p>
        
        <p>Best of luck! 🚀</p>
        
        <p>
          Regards,<br>
          <strong>Placement Team</strong><br>
          Training & Placement Cell
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated email, please do not reply. For support, contact the placement office.</p>
      </div>
    </div>
    `;

    await sendEmail({
      to: studentEmail,
      subject: `Interview Scheduled: ${companyName} - ${round}`,
      html: emailTemplate
    });
    
    console.log(`✅ Interview schedule email sent to ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending interview email:', error.message);
    return false;
  }
};

// Send bulk interview schedules to students
const sendBulkInterviewEmails = async (schedules) => {
  const results = [];
  for (const schedule of schedules) {
    try {
      await sendInterviewScheduleEmail(
        schedule.studentEmail,
        schedule.studentName,
        schedule.interviewData
      );
      results.push({ email: schedule.studentEmail, success: true });
    } catch (error) {
      console.error(`Error sending to ${schedule.studentEmail}:`, error.message);
      results.push({ email: schedule.studentEmail, success: false });
    }
  }
  return results;
};

// Send interview cancellation email
const sendInterviewCancellationEmail = async (studentEmail, studentName, interviewData) => {
  try {
    const { companyName, role, round, interviewDate } = interviewData;
    
    const formattedDate = new Date(interviewDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Interview Cancelled</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
        <p>Hi <strong>${studentName}</strong>,</p>
        
        <p>We regret to inform you that your interview has been cancelled.</p>
        
        <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; border-radius: 4px;">
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Position:</strong> ${role}</p>
          <p><strong>Round:</strong> ${round}</p>
          <p><strong>Scheduled Date:</strong> ${formattedDate}</p>
        </div>
        
        <p>If you have any questions, please contact our placement team.</p>
        
        <p>
          Regards,<br>
          <strong>Placement Team</strong><br>
          Training & Placement Cell
        </p>
      </div>
    </div>
    `;

    await sendEmail({
      to: studentEmail,
      subject: `Interview Cancelled: ${companyName} - ${round}`,
      html: emailTemplate
    });
    
    console.log(`✅ Interview cancellation email sent to ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error.message);
    return false;
  }
};

module.exports = {
  sendInterviewScheduleEmail,
  sendBulkInterviewEmails,
  sendInterviewCancellationEmail
};
