# OAuth Implementation Guide

This guide will help you set up Google and GitHub OAuth for your TNP application.

## Overview

Your application now supports two OAuth providers:

- **Google OAuth 2.0** - For students to sign in with their Google accounts
- **GitHub OAuth** - For developers to sign in with their GitHub accounts

Both providers are integrated into the login flow for students only (not for admin login).

---

## Prerequisites

- Node.js installed on your system
- Google Cloud Console account
- GitHub account with developer access
- Frontend URL: `http://localhost:8080`
- Backend URL: `http://localhost:5002`

---

## Step 1: Set Up Google OAuth

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "TNP Portal" (or any name)
5. Click "CREATE"
6. Wait for the project to be created (this may take a minute)

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services"
2. Click "ENABLE APIS AND SERVICES" at the top
3. Search for "Google+ API"
4. Click on "Google+ API" in the results
5. Click the "ENABLE" button

### 1.3 Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. You may be prompted to configure the OAuth consent screen first:
   - Click "CONFIGURE CONSENT SCREEN"
   - Select "External" user type
   - Click "CREATE"
   - Fill in the required fields:
     - App name: "TNP Portal"
     - User support email: Your email
     - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Skip through the "Scopes" section and click "SAVE AND CONTINUE"
   - Add yourself as a test user if desired
   - Click "SAVE AND CONTINUE"

4. After consent screen is configured, go back to "Credentials"
5. Click "CREATE CREDENTIALS" → "OAuth client ID"
6. Choose "Web application"
7. Name it "TNP Portal Web"
8. Under "Authorized JavaScript origins", add:
   - `http://localhost:8080`
   - `http://localhost:5002`
9. Under "Authorized redirect URIs", add:
   - `http://localhost:5002/api/auth/google/callback`
10. Click "CREATE"
11. Copy your **Client ID** and **Client Secret**
12. Store them safely

---

## Step 2: Set Up GitHub OAuth

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following:
   - **Application name**: TNP Portal
   - **Homepage URL**: `http://localhost:8080`
   - **Application description**: Virtual TNP Portal for Student Placement
   - **Authorization callback URL**: `http://localhost:5002/api/auth/github/callback`
4. Click "Register application"
5. You'll see your **Client ID**
6. Click "Generate a new client secret" to get your **Client Secret**
7. Store them safely

---

## Step 3: Configure Environment Variables

### 3.1 Backend Configuration

Update your `server/.env` file with the OAuth credentials:

```env
# OAuth Configuration - Google
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OAuth Configuration - GitHub
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:8080
```

### 3.2 Frontend Configuration (Already Set)

The frontend uses environment variables from Vite. Make sure your `.env.local` or environment variables include:

```
VITE_API_URL=http://localhost:5002
```

---

## Step 4: Install Dependencies

### 4.1 Backend Dependencies

```bash
cd server
npm install
```

The following packages have been added:

- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-github2` - GitHub OAuth strategy
- `express-session` - Session management

### 4.2 Frontend Dependencies

No additional dependencies needed for the frontend. The OAuth buttons use existing UI components.

---

## Step 5: Database Update

Your User model has been updated to support OAuth:

**New OAuth fields in User schema:**

```javascript
oauth: [
  {
    provider: { type: String, enum: ["google", "github"] },
    oauthId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date },
  },
];
```

**Important**: Make sure `password` field is no longer required for OAuth users.

---

## Step 6: Starting the Application

### 6.1 Backend

```bash
cd server
npm start
```

The server will start on port 5002 with OAuth routes:

- Google login: `/api/auth/google`
- Google callback: `/api/auth/google/callback`
- GitHub login: `/api/auth/github`
- GitHub callback: `/api/auth/github/callback`

### 6.2 Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:8080`

---

## Step 7: Testing OAuth

### 7.1 Test Google OAuth

1. Open `http://localhost:8080/login` in your browser
2. Make sure "Student" role is selected (default)
3. Click the Google button
4. You'll be redirected to Google's login page
5. Sign in with your Google account
6. Grant permissions when prompted
7. You'll be redirected to `/auth-success` page
8. After processing, you'll be redirected to the student dashboard

### 7.2 Test GitHub OAuth

1. Open `http://localhost:8080/login`
2. Make sure "Student" role is selected
3. Click the GitHub button
4. You'll be redirected to GitHub's login page
5. Sign in with your GitHub account
6. Grant permissions when prompted
7. You'll be redirected to `/auth-success` page
8. After processing, you'll be redirected to the student dashboard

---

## How OAuth Flow Works

### 1. User Initiates Login

User clicks "Sign in with Google" or "Sign in with GitHub" button on the login page.

### 2. Redirect to Provider

User is redirected to Google/GitHub login page via `/api/auth/google` or `/api/auth/github` endpoint.

### 3. User Authenticates

User enters their credentials and grants permissions.

### 4. Provider Redirect to Callback

Provider (Google/GitHub) redirects user to the callback URL with an authorization code.

### 5. Backend Verification

Backend exchanges the code for user information:

- User data (name, email, profile picture)
- OAuth ID and tokens
- Stores/updates user in database

### 6. JWT Token Generation

Backend generates a JWT token for the user.

### 7. Redirect to Frontend

User is redirected to `http://localhost:8080/auth-success?token=...&user=...`

### 8. Token Processing

Frontend parses the token and user data from URL:

- Stores token in localStorage
- Updates Auth context
- Redirects to student dashboard

---

## User Creation and Linking

### New User (First OAuth Login)

When a user logs in via OAuth for the first time:

- A new user record is created in MongoDB
- OAuth provider info is stored
- User role defaults to "student"
- Password is set to null (OAuth users don't have passwords)

### Existing User

If a user with the same email already exists:

- OAuth provider info is added to their account
- User can now login via OAuth or original method

### Multiple OAuth Providers

A single user can link multiple OAuth providers to their account. For example:

- User A logs in with Google first
- User A later logs in with GitHub using the same email
- Their GitHub account is linked to the same user profile

---

## API Endpoints

### OAuth Endpoints

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/auth/google`          | Initiate Google OAuth login    |
| GET    | `/api/auth/google/callback` | Google OAuth callback          |
| GET    | `/api/auth/github`          | Initiate GitHub OAuth login    |
| GET    | `/api/auth/github/callback` | GitHub OAuth callback          |
| GET    | `/api/auth/me`              | Get current authenticated user |
| POST   | `/api/auth/verify-token`    | Verify JWT token validity      |

### Example: Verify Token

```bash
curl -X POST http://localhost:5002/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"your_jwt_token_here"}'
```

---

## Troubleshooting

### Issue 1: "redirect_uri_mismatch" Error

**Cause**: The callback URL registered in OAuth provider doesn't match the one in your code.

**Solution**:

- For Google: Add `http://localhost:5002/api/auth/google/callback` to Authorized redirect URIs
- For GitHub: Ensure Authorization callback URL is exactly `http://localhost:5002/api/auth/github/callback`

### Issue 2: OAuth Buttons Not Appearing

**Cause**: Frontend not loading OAuthButton component properly.

**Solution**:

- Check that `OAuthButton.tsx` is in `src/components/`
- Verify import statement in Login.tsx is correct
- Check browser console for any import errors

### Issue 3: "Invalid Client Secret" Error

**Cause**: Client ID or Secret is incorrect in `.env` file.

**Solution**:

1. Double-check your credentials from Google Cloud Console / GitHub
2. Make sure there are no extra spaces in `.env`
3. Restart the server after updating `.env`

### Issue 4: User Not Created After OAuth Login

**Cause**: Database connection issue or Passport configuration problem.

**Solution**:

1. Check MongoDB connection in console
2. Verify Passport middleware is initialized in `server.js`
3. Check server logs for any errors

### Issue 5: Token Not Being Stored

**Cause**: AuthContext not properly updating user state.

**Solution**:

1. Check browser's Application → Storage → localStorage for token
2. Verify `/auth-success` page is being loaded
3. Check browser console for any errors in OAuthSuccess component

### Issue 6: Admin Cannot Login via OAuth

**Current Design**: OAuth buttons are disabled for Admin role.

**Note**: This is intentional. Admins use email/password login for security. If you want to enable OAuth for admins, you'll need to:

1. Remove the `role === 'student'` condition in Login.tsx
2. Update OAuth controller to handle admin role

---

## Security Considerations

1. **Store Secrets Safely**
   - Never commit `.env` file to version control
   - Use `.env.example` with placeholder values

2. **HTTPS in Production**
   - Change `http://` to `https://` in production URLs
   - Update OAuth provider configurations accordingly

3. **Token Expiration**
   - JWT tokens expire in 30 days
   - Implement token refresh mechanism for long sessions

4. **Password Not Required**
   - OAuth users don't have passwords stored
   - Only OAuth provider tokens are stored

5. **Scopes**
   - Google: requests `profile` and `email` scopes
   - GitHub: requests `user:email` and `read:user` scopes

---

## Next Steps

1. Replace placeholder credentials in `server/.env`
2. Test both OAuth flows thoroughly
3. Update production URLs when deploying
4. Implement password reset for traditional login
5. Add email verification for new OAuth users (optional)
6. Implement token refresh mechanism (optional)

---

## Useful Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Express Session Documentation](https://github.com/expressjs/session)

---

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify `.env` file configuration
4. Check OAuth provider settings
5. Consult the resources section

Good luck with your OAuth implementation! 🚀
