const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

/**
 * Test email endpoint
 * POST /api/test/send-mail
 * Body: { email: "user@example.com", subject: "Test Subject", message: "Test message" }
 */
router.post('/send-mail', async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, subject, message' 
      });
    }

    // Create HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0;">${subject}</h2>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated email from TNP System</p>
        </div>
      </div>
    `;

    // Send email using Brevo
    await sendEmail({
      to: email,
      subject: subject,
      html: htmlContent
    });

    res.json({ 
      success: true,
      message: 'Email sent successfully',
      email: email 
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

/**
 * Welcome email example
 * POST /api/test/welcome-mail
 * Body: { email: "user@example.com", name: "John Doe" }
 */
router.post('/welcome-mail', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name' 
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Welcome to TNP System! 🎉</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px;">
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>Welcome to the Training & Placement Cell portal! 🚀</p>
          
          <p>You can now:</p>
          <ul>
            <li>Browse available job opportunities</li>
            <li>Apply to drives matching your profile</li>
            <li>Schedule and track interviews</li>
            <li>Prepare with interview tips and resources</li>
          </ul>
          
          <p>Best of luck with your placements!</p>
          
          <p>
            Regards,<br>
            <strong>Placement Team</strong><br>
            Training & Placement Cell
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: `Welcome to TNP System, ${name}! 🎉`,
      html: htmlContent
    });

    res.json({ 
      success: true,
      message: 'Welcome email sent successfully',
      email: email 
    });

  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ 
      error: 'Failed to send welcome email',
      details: error.message 
    });
  }
});

module.exports = router;
