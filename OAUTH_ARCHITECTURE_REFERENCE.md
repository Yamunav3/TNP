# OAuth Implementation - File Structure & Reference

## 📁 New Files Created

### Backend Configuration

```
server/
├── config/
│   └── passport.js (NEW)
│       ├── GoogleStrategy - Google OAuth 2.0 configuration
│       ├── GitHubStrategy - GitHub OAuth configuration
│       ├── serializeUser - Session serialization
│       └── deserializeUser - Session deserialization
│
├── controllers/
│   └── oauthController.js (NEW)
│       ├── googleCallback - Google OAuth callback handler
│       ├── githubCallback - GitHub OAuth callback handler
│       ├── getCurrentUser - Get authenticated user
│       └── verifyOAuthToken - Token verification
│
└── routes/
    └── oauthRoutes.js (NEW)
        ├── GET /google - Initiate Google OAuth
        ├── GET /google/callback - Google callback
        ├── GET /github - Initiate GitHub OAuth
        ├── GET /github/callback - GitHub callback
        ├── GET /me - Get current user
        └── POST /verify-token - Verify token
```

### Frontend Components

```
src/
├── components/
│   └── OAuthButton.tsx (NEW)
│       ├── Props: provider (google|github), onClick, compact
│       ├── Renders OAuth button with provider icon
│       └── Handles redirect to backend OAuth endpoint
│
└── pages/
    └── OAuthSuccess.tsx (NEW)
        ├── Handles OAuth callback with token/user params
        ├── Updates AuthContext
        ├── Stores token in localStorage
        └── Redirects to dashboard
```

### Documentation

```
Root Directory Files (NEW):
├── OAUTH_SETUP_GUIDE.md
│   └── 400+ line comprehensive setup guide
├── OAUTH_QUICK_START.md
│   └── Quick checklist and common issues
├── OAUTH_IMPLEMENTATION_SUMMARY.md
│   └── High-level overview and features
├── OAUTH_TESTING_GUIDE.md
│   └── Testing procedures and verification
└── OAUTH_ARCHITECTURE_REFERENCE.md (this file)
    └── File structure and technical reference
```

---

## 📝 Modified Files

### Backend Files

**server/package.json**

```json
Added dependencies:
- "passport": "^0.7.0"
- "passport-google-oauth20": "^2.0.0"
- "passport-github2": "^0.1.12"
- "express-session": "^1.17.3"
- "axios": "^1.6.2"
```

**server/server.js**

```javascript
Added imports:
+ const session = require('express-session');
+ const passport = require('passport');

Added middleware (after CORS):
+ app.use(session({...})) // Express session configuration
+ app.use(passport.initialize())
+ app.use(passport.session())

Added routes (in Routes section):
+ app.use('/api/auth', require('./routes/oauthRoutes'));
```

**server/models/User.js**

```javascript
Modified fields:
- password: { type: String, required: true }  // OLD
+ password: { type: String }  // NEW - Now optional for OAuth users

Added oauth field:
+ oauth: [{
    provider: { type: String, enum: ['google', 'github'] },
    oauthId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date }
  }]
```

**server/.env**

```env
Added:
FRONTEND_URL=http://localhost:8080
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

### Frontend Files

**src/App.tsx**

```typescript
Added import:
+ import { OAuthSuccess } from "./pages/OAuthSuccess";

Added route:
+ <Route path="/auth-success" element={<OAuthSuccess />} />
```

**src/pages/authentication/Login.tsx**

```typescript
Added import:
+ import { OAuthButton } from '@/components/OAuthButton';

Added in JSX (after sign-in button):
+ <div className="relative my-8">
+   <div className="absolute inset-0 flex items-center">
+     <div className="w-full border-t border-muted"></div>
+   </div>
+   <div className="relative flex justify-center text-xs uppercase">
+     <span className="bg-background px-2 text-muted-foreground">
+       Or continue with
+     </span>
+   </div>
+ </div>
+
+ <div className="grid grid-cols-2 gap-3">
+   <OAuthButton provider="google" />
+   <OAuthButton provider="github" />
+ </div>
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OAUTH IMPLEMENTATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (React + TypeScript)
    │
    ├─ Login Page (/login)
    │   │
    │   └─ OAuthButton Component
    │       │
    │       └─ onClick → Redirect to: /api/auth/google
    │                              or: /api/auth/github
    │
    └─ OAuthSuccess Page (/auth-success)
        │
        └─ Parse URL params (token, user)
            │
            └─ AuthContext.updateUser(token, user)
                │
                └─ localStorage.setItem(user, token)
                    │
                    └─ Navigate to /student/dashboard

                    ↓

BACKEND (Express + Node.js)
    │
    ├─ OAuth Routes (/api/auth)
    │   │
    │   ├─ GET /google
    │   │   └─ passport.authenticate('google')
    │   │       └─ Redirect to Google Login
    │   │
    │   ├─ GET /google/callback
    │   │   └─ passport.authenticate('google')
    │   │       └─ Passport Strategy (GoogleStrategy)
    │   │
    │   ├─ GET /github
    │   │   └─ passport.authenticate('github')
    │   │       └─ Redirect to GitHub Login
    │   │
    │   └─ GET /github/callback
    │       └─ passport.authenticate('github')
    │           └─ Passport Strategy (GitHubStrategy)
    │
    ├─ Passport Config (server/config/passport.js)
    │   │
    │   ├─ GoogleStrategy
    │   │   └─ Exchange code for user info
    │   │       └─ Find or create user in database
    │   │
    │   └─ GitHubStrategy
    │       └─ Exchange code for user info
    │           └─ Find or create user in database
    │
    └─ OAuth Controller (server/controllers/oauthController.js)
        │
        ├─ googleCallback()
        │   └─ Generate JWT token
        │       └─ Redirect: http://localhost:8080/auth-success?token=...&user=...
        │
        └─ githubCallback()
            └─ Generate JWT token
                └─ Redirect: http://localhost:8080/auth-success?token=...&user=...

        ↓

DATABASE (MongoDB)
    │
    └─ User Document
        {
          _id: ObjectId,
          name: "User Name",
          email: "user@provider.com",
          password: null,                    ← No password
          oauth: [{
            provider: "google",              ← Provider info
            oauthId: "123456789",
            accessToken: "ya29.a0...",
            refreshToken: "1//0...",
            expiresAt: ISODate(...)
          }]
        }
```

---

## 🔐 Security Architecture

```
Client-Side Security
├─ Token Storage: localStorage
├─ Token Type: JWT (30-day expiration)
├─ CORS: Credentials enabled
└─ HttpOnly: No (consider for production)

Server-Side Security
├─ Session: Express-session
├─ OAuth Scopes: Minimal (profile, email only)
├─ Token Verification: JWT verification on protected routes
├─ Password: Null for OAuth users (cannot login with email/password)
└─ Environment Variables: Keep credentials in .env

Database Security
├─ MongoDB Connection: SSL/TLS (via MongoDB Atlas)
├─ User Data: Hashed when applicable
├─ OAuth Tokens: Stored in database (consider encryption)
└─ Access Control: Role-based (student/admin)
```

---

## 📊 Dependency Tree

```
passport (Core authentication framework)
├── passport-google-oauth20 (Google OAuth strategy)
├── passport-github2 (GitHub OAuth strategy)
└── express-session (Session management)

express
├── cors (CORS handling)
├── express-json (Built-in JSON parser)
└── other existing middleware

jsonwebtoken
└── Used for generating JWT tokens

bcryptjs
└── For password hashing (existing, still used for email/password login)

axios
└── For HTTP requests (added for potential future use)
```

---

## 🎯 Feature Matrix

| Feature              | Status      | Location                                                   |
| -------------------- | ----------- | ---------------------------------------------------------- |
| Google OAuth         | ✅ Complete | server/config/passport.js, src/components/OAuthButton.tsx  |
| GitHub OAuth         | ✅ Complete | server/config/passport.js, src/components/OAuthButton.tsx  |
| User Creation        | ✅ Complete | server/controllers/oauthController.js                      |
| Token Generation     | ✅ Complete | server/controllers/oauthController.js                      |
| Token Verification   | ✅ Complete | server/controllers/oauthController.js                      |
| Session Management   | ✅ Complete | server/server.js                                           |
| Frontend Integration | ✅ Complete | src/components/OAuthButton.tsx, src/pages/OAuthSuccess.tsx |
| Route Protection     | ✅ Complete | src/App.tsx (ProtectedRoute)                               |
| Database Schema      | ✅ Complete | server/models/User.js                                      |

---

## 🚀 Deployment Checklist

**Before Production Deployment:**

```
Security
├─ [ ] Change FRONTEND_URL to production domain
├─ [ ] Use HTTPS URLs (https://) everywhere
├─ [ ] Update OAuth provider URLs to production domain
├─ [ ] Enable HTTPS only cookies
├─ [ ] Implement token refresh mechanism
└─ [ ] Add email verification for OAuth users

Performance
├─ [ ] Implement OAuth token caching
├─ [ ] Add request rate limiting
├─ [ ] Optimize user creation/update queries
└─ [ ] Consider CDN for static assets

Testing
├─ [ ] Test OAuth flow end-to-end
├─ [ ] Test with multiple browsers
├─ [ ] Test on mobile devices
├─ [ ] Test error scenarios
└─ [ ] Load test authentication endpoints

Monitoring
├─ [ ] Setup error logging
├─ [ ] Monitor OAuth callback failures
├─ [ ] Track authentication metrics
└─ [ ] Setup alerts for suspicious activity
```

---

## 📞 Support & Resources

**Files to Reference:**

1. `OAUTH_SETUP_GUIDE.md` - Complete setup instructions
2. `OAUTH_QUICK_START.md` - Quick reference
3. `OAUTH_TESTING_GUIDE.md` - Testing procedures
4. `OAUTH_IMPLEMENTATION_SUMMARY.md` - Feature overview
5. This file - Architecture reference

**Configuration Files:**

- `server/.env` - Environment variables
- `server/config/passport.js` - OAuth strategies
- `server/package.json` - Dependencies

**API Endpoints:**

- `POST /api/auth/verify-token` - Verify JWT
- `GET /api/auth/me` - Current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

---

**Implementation Date:** 2025-06-06
**Status:** ✅ Complete and Ready for Testing
