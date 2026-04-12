const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

/**
 * Send email using Brevo API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (optional, uses EMAIL_FROM from env)
 * @returns {Promise<Object>} - API response
 */
const sendEmail = async ({ to, subject, html, from }) => {
  try {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured in environment');
    }

    const payload = {
      sender: { 
        email: from || process.env.EMAIL_FROM,
        name: 'TNP System'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    };

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return response.data;
  } catch (err) {
    console.error('❌ Email error:', err.message);
    throw new Error(`Email failed: ${err.message}`);
  }
};

module.exports = sendEmail;
