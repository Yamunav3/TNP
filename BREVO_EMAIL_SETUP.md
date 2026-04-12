# Brevo Email Integration - Setup & Usage

## ✅ Already Configured

Your Brevo API credentials are already set in `.env`:
```
BREVO_API_KEY=xsmtpsib-...
EMAIL_FROM=yamunav32006@gmail.com
```

## 📁 Files Created

### 1. `server/utils/sendEmail.js`
The main utility for sending emails using Brevo API. This is the core function used throughout the app.

**Usage:**
```javascript
const sendEmail = require('../utils/sendEmail');

await sendEmail({
  to: 'user@example.com',
  subject: 'Interview Scheduled',
  html: '<h2>Your interview is scheduled</h2>'
});
```

### 2. `server/services/emailService.js` (Updated)
Updated to use Brevo instead of nodemailer. Contains:
- `sendInterviewScheduleEmail()` - Send interview notifications
- `sendBulkInterviewEmails()` - Send to multiple students
- `sendInterviewCancellationEmail()` - Send cancellations

### 3. `server/routes/testEmailRoutes.js`
Test endpoints to verify email sending works:

**Endpoints:**
- `POST /api/test/send-mail` - Send custom email
- `POST /api/test/welcome-mail` - Send welcome email

## 🧪 Test Email Endpoints

### 1. Send Custom Email
```bash
curl -X POST http://localhost:5002/api/test/send-mail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email": "student@example.com"
}
```

### 2. Send Welcome Email
```bash
curl -X POST http://localhost:5002/api/test/welcome-mail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Doe"
  }'
```

## 🚀 How Interview Emails Work

When admin schedules interviews:

1. Admin selects students and creates schedule
2. `createInterviewScheduleForStudents()` is called
3. For each student:
   - InterviewSchedule document is created
   - `sendInterviewScheduleEmail()` is called
   - Brevo API sends email to student
   - `emailSent = true` and `emailSentAt` are recorded

**Email includes:**
- ✅ Company name & position
- ✅ Interview round
- ✅ Date & time (formatted)
- ✅ Meeting link (for online interviews)
- ✅ Venue location (for offline interviews)
- ✅ Preparation tips
- ✅ Professional HTML template

## 📧 Email Template Example

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(...); padding: 30px; color: white; ...">
    <h1>Interview Scheduled! 🎉</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; ...">
    <p>Hi John,</p>
    
    <p>Great news! Your interview has been scheduled. Here are the details:</p>
    
    <div style="background: white; padding: 20px; ...">
      <p><strong>Company:</strong> Google</p>
      <p><strong>Position:</strong> Software Engineer</p>
      <p><strong>Round:</strong> Technical Round 1</p>
      <p><strong>Date:</strong> April 15, 2026</p>
      <p><strong>Time:</strong> 10:00 AM</p>
      <p><strong>Meeting Link:</strong> https://zoom.us/j/...</p>
    </div>
    
    <div style="background: #fff3cd; ...">
      <strong>Important:</strong>
      <ul>
        <li>Be online 5-10 minutes before</li>
        <li>Have all documents ready</li>
      </ul>
    </div>
  </div>
</div>
```

## 🔄 Integration Points

### Interview Controller
When admin creates bulk schedules:
```javascript
// In interviewController.js
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
}
```

### Cancel Interview
When admin cancels schedule:
```javascript
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
```

## 🛠️ Customization

### To change email sender name:
Edit `server/utils/sendEmail.js`:
```javascript
sender: { 
  email: from || process.env.EMAIL_FROM,
  name: 'Your Company Name'  // ← Change this
}
```

### To customize email templates:
Edit the HTML in `emailService.js`:
- `sendInterviewScheduleEmail()` - Interview notification template
- `sendInterviewCancellationEmail()` - Cancellation template

### To change styling:
Modify the inline CSS in the HTML templates

## 📊 Email Tracking

All sent emails are tracked in the database:
```javascript
{
  emailSent: true,              // Was email sent?
  emailSentAt: Date,            // When was it sent?
  status: 'scheduled',          // Interview status
  scheduledBy: 'automatic',     // Who scheduled it?
}
```

## ⚠️ Troubleshooting

### Email not sending?
1. Check console for errors
2. Verify `BREVO_API_KEY` is correct
3. Verify `EMAIL_FROM` is a valid email
4. Check Brevo API status at brevo.com

### Email going to spam?
- Brevo has good deliverability
- Make sure email addresses are valid
- Check spam folder
- Auth domain SPF/DKIM settings

### Test email not arriving?
1. Try test endpoint: `POST /api/test/send-mail`
2. Check console logs
3. Verify recipient email is correct
4. Check spam folder

## 🔗 Useful Links

- **Brevo API Docs:** https://developers.brevo.com/
- **Brevo Dashboard:** https://app.brevo.com/
- **API Keys:** https://app.brevo.com/settings/integration/keys

## 📝 API Reference

### sendEmail(options)
```javascript
const sendEmail = require('../utils/sendEmail');

/**
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (optional)
 * @returns {Promise<Object>} - Brevo API response
 */
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Test Subject',
  html: '<h2>Content</h2>',
  from: 'custom@example.com' // optional
});
```

## ✅ Verification Checklist

- [ ] Brevo account created
- [ ] API key generated
- [ ] `.env` has BREVO_API_KEY
- [ ] `sendEmail.js` created
- [ ] `emailService.js` updated
- [ ] Test routes added to server
- [ ] Test email endpoint working
- [ ] Interview emails sending successfully

---

**All set! Email notifications are ready to use.** 🎉
