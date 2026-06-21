# OAuth Testing & API Examples

## Testing the OAuth Implementation

### Prerequisites

- Backend running on `http://localhost:5002`
- Frontend running on `http://localhost:8080`
- MongoDB connected
- OAuth credentials configured in `.env`

---

## 🧪 Manual Testing

### Test 1: Google OAuth Flow

**Steps:**

1. Open `http://localhost:8080/login` in browser
2. Ensure "Student" role is selected (default)
3. Click "Google" button (with Google icon)
4. You'll be redirected to Google login page
5. Sign in with your Google account
6. Click "Continue" to grant permissions
7. Should be redirected to `http://localhost:8080/auth-success`
8. Loading spinner should appear for ~2 seconds
9. Redirected to student dashboard at `http://localhost:8080/student/dashboard`

**Verify in Browser:**

- Open DevTools → Application → Storage → LocalStorage
- You should see:
  - `user` key with user object (including token)
  - `token` key with JWT token

**Verify in MongoDB:**

```javascript
db.users.findOne({ email: "your-google-email@gmail.com" });
// Should return user with oauth array containing google provider info
```

---

### Test 2: GitHub OAuth Flow

**Steps:**

1. Open `http://localhost:8080/login` in new incognito window
2. Select "Student" role
3. Click "GitHub" button
4. Sign in with GitHub account
5. Authorize the application
6. Should follow same flow as Google test
7. Verify in localStorage and MongoDB

---

### Test 3: OAuth Buttons Visibility

**Expected:**

- OAuth buttons appear **only** when Student role is selected
- OAuth buttons disappear when Admin role is selected

**Test:**

1. Open login page
2. Toggle between Student and Admin
3. Observe OAuth buttons appear/disappear

---

## 📡 API Testing with cURL/Postman

### Test Token Verification

**Endpoint:** `POST /api/auth/verify-token`

**Request:**

```bash
curl -X POST http://localhost:5002/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your_jwt_token_from_localstorage"
  }'
```

**Expected Response:**

```json
{
  "valid": true,
  "user": {
    "_id": "user_id_here",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student",
    "image": "profile_picture_url",
    "token": "jwt_token"
  }
}
```

---

### Test Get Current User

**Endpoint:** `GET /api/auth/me`

**Request:**

```bash
curl -X GET http://localhost:5002/api/auth/me \
  -H "Authorization: Bearer your_jwt_token"
```

**Expected Response:**

```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "student",
  "image": "profile_picture_url",
  "department": null,
  "year": null,
  "phone": null,
  "address": null,
  "linkedin": null,
  "github": "github_username",
  "token": "jwt_token"
}
```

---

## 🔍 Server-Side Testing

### Check OAuth Routes Are Registered

**In your browser, try accessing:**

- `http://localhost:5002/api/auth/google` - Should redirect to Google
- `http://localhost:5002/api/auth/github` - Should redirect to GitHub

---

### Monitor Server Logs

**Expected logs when user logs in via Google:**

```
Passport Google strategy called
User profile retrieved from Google
User created/updated in database
JWT token generated
Callback URL: http://localhost:8080/auth-success?token=...&user=...
```

**Expected logs when user logs in via GitHub:**

```
Passport GitHub strategy called
User profile retrieved from GitHub
User created/updated in database
JWT token generated
Callback URL: http://localhost:8080/auth-success?token=...&user=...
```

---

## 🗄️ Database Verification

### Check Created User Structure

```javascript
// Connect to MongoDB
db.users.findOne({ email: 'user@gmail.com' });

// Expected output:
{
  "_id": ObjectId("..."),
  "name": "User Name",
  "email": "user@gmail.com",
  "password": null,  // No password for OAuth users
  "image": "https://...",
  "role": "student",
  "oauth": [
    {
      "provider": "google",
      "oauthId": "123456789",
      "accessToken": "ya29.a0...",
      "refreshToken": "1//0...",
      "expiresAt": ISODate("2025-06-06T...")
    }
  ],
  "createdAt": ISODate("2025-06-06T...")
}
```

### Check Multiple OAuth Providers

```javascript
// User with both Google and GitHub
db.users.findOne({
  oauth: {
    $size: 2,
    $elemMatch: { provider: "google" },
    $elemMatch: { provider: "github" },
  },
});
```

---

## ⚠️ Troubleshooting Tests

### Test 1: Invalid Callback URL

**Problem:** "redirect_uri_mismatch" error

**Test Fix:**

1. Open Google Cloud Console / GitHub Settings
2. Verify callback URL is exactly: `http://localhost:5002/api/auth/google/callback`
3. No trailing slashes, exact match required

---

### Test 2: Missing Credentials

**Problem:** OAuth buttons work but Google login fails

**Test Fix:**

1. Check `server/.env` has valid credentials
2. Restart backend server (`npm start`)
3. Verify environment variables loaded:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID)"
   ```

---

### Test 3: Token Not Persisting

**Problem:** Page refresh loses user login

**Test:**

1. Login via OAuth
2. Open DevTools → Application → Storage → LocalStorage
3. Check `user` and `token` keys exist
4. If missing, check OAuthSuccess component logs
5. If present, check AuthContext useEffect in Login page

---

### Test 4: User Not Created

**Problem:** OAuth login succeeds but user not in database

**Test:**

1. Check MongoDB connection in server logs
2. Verify Passport deserializeUser function works
3. Check server logs for errors in user creation
4. Test MongoDB connection directly:
   ```bash
   node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e.message))"
   ```

---

## 📊 Performance Testing

### Load Time Check

**Google OAuth Complete Flow:**

- Login page load: <500ms
- Redirect to Google: <200ms
- Google auth: User dependent (usually <5s)
- Callback processing: <500ms
- Redirect to dashboard: <200ms
- **Total:** Typically 5-10 seconds

**GitHub OAuth Complete Flow:**

- Similar timing to Google OAuth

---

## 🔐 Security Testing

### Test 1: Invalid Token Rejection

**Endpoint:** `POST /api/auth/verify-token`

**Request with invalid token:**

```bash
curl -X POST http://localhost:5002/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid_token_here"}'
```

**Expected Response:**

```json
{
  "message": "Invalid token",
  "valid": false
}
```

### Test 2: Missing Authorization Header

**Endpoint:** `GET /api/auth/me`

**Request without token:**

```bash
curl -X GET http://localhost:5002/api/auth/me
```

**Expected Response:**

```json
{
  "message": "No token provided"
}
```

Status: 401 Unauthorized

---

## 📝 Test Report Template

Use this template to document your testing:

```
OAuth Implementation Test Report
Date: ____________________
Tester: ____________________

[ ] Google OAuth Login
    - Successfully redirected to Google
    - Successfully authenticated
    - User created in database
    - Redirected to dashboard
    - Token stored in localStorage

[ ] GitHub OAuth Login
    - Successfully redirected to GitHub
    - Successfully authenticated
    - User created in database
    - Redirected to dashboard
    - Token stored in localStorage

[ ] OAuth Buttons Visibility
    - Visible for Student role
    - Hidden for Admin role

[ ] Token Verification
    - Valid token returns user data
    - Invalid token returns error

[ ] Database
    - Users created with oauth array
    - Multiple OAuth providers stored correctly

[ ] Edge Cases
    - Same email from different providers
    - Refresh page during OAuth flow
    - Browser back button during auth

Issues Found:
1. ________________
2. ________________
3. ________________

Notes:
__________________________________
__________________________________
```

---

## ✅ Final Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads without errors
- [ ] OAuth buttons appear on login page for students
- [ ] Google OAuth button redirects to Google login
- [ ] GitHub OAuth button redirects to GitHub login
- [ ] User successfully authenticates and is redirected to dashboard
- [ ] User created in MongoDB with oauth array
- [ ] Token stored in browser localStorage
- [ ] Token verification endpoint works
- [ ] Invalid tokens are rejected

---

## 📞 Quick Reference

**Backend OAuth Routes:**

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub callback

**Frontend Routes:**

- `/login` - Login page (with OAuth buttons)
- `/auth-success` - OAuth callback handler
- `/student/dashboard` - Protected student dashboard

**Environment Variables Needed:**

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `FRONTEND_URL`

---

Good luck with your OAuth testing! 🎉
