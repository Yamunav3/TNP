const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth Strategy
const normalizeBackendUrl = (value, fallback) => {
  const raw = String(value || fallback || "").trim().replace(/\/+$/, "");
  return raw;
};

const backendUrl = normalizeBackendUrl(
  process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.API_URL,
  "http://localhost:5002"
);



// console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
// console.log("CALLBACK:", process.env.GOOGLE_CALLBACK_URL);
// console.log("FRONTEND:", process.env.FRONTEND_URL);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        `${backendUrl}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from Google profile
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const profilePicture = photos[0].value;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update OAuth info if user already exists
          const existingOAuth = user.oauth.find(o => o.provider === 'google');
          if (!existingOAuth) {
            user.oauth.push({
              provider: 'google',
              oauthId: id,
              accessToken,
              refreshToken,
              expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
            });
          } else {
            existingOAuth.accessToken = accessToken;
            existingOAuth.refreshToken = refreshToken;
            existingOAuth.expiresAt = new Date(Date.now() + 3600 * 1000);
          }
          await user.save();
        } else {
          // Create new user if doesn't exist
          user = await User.create({
            name: displayName,
            email,
            image: profilePicture,
            role: 'student',
            password: null, // No password for OAuth users
            oauth: [
              {
                provider: 'google',
                oauthId: id,
                accessToken,
                refreshToken,
                expiresAt: new Date(Date.now() + 3600 * 1000),
              },
            ],
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: '/api/auth/github/callback',
//       scope: ['user:email'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Extract user info from GitHub profile
//         const { id, login, displayName, emails, avatar_url } = profile;
//         const email = emails && emails[0] ? emails[0].value : `${login}@github.com`;
//         const name = displayName || login;

//         // Check if user already exists
//         let user = await User.findOne({ email });

//         if (user) {
//           // Update OAuth info if user already exists
//           const existingOAuth = user.oauth.find(o => o.provider === 'github');
//           if (!existingOAuth) {
//             user.oauth.push({
//               provider: 'github',
//               oauthId: id,
//               accessToken,
//               refreshToken: refreshToken || null,
//               expiresAt: null,
//             });
//           } else {
//             existingOAuth.accessToken = accessToken;
//             existingOAuth.refreshToken = refreshToken || null;
//           }
//           user.github = login;
//           await user.save();
//         } else {
//           // Create new user if doesn't exist
//           user = await User.create({
//             name,
//             email,
//             github: login,
//             image: avatar_url,
//             role: 'student',
//             password: null, // No password for OAuth users
//             oauth: [
//               {
//                 provider: 'github',
//                 oauthId: id,
//                 accessToken,
//                 refreshToken: refreshToken || null,
//                 expiresAt: null,
//               },
//             ],
//           });
//         }

//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
