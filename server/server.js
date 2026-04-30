
const express = require('express');
const http = require('http'); 
const net = require('net');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 1. Config & App Setup
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const server = http.createServer(app);

// --- ALLOWED ORIGINS (Add your port 8080 here) ---
// --- ALLOWED ORIGINS (Robust Version) ---
const allowedOrigins = [
  
  "http://localhost:8080", // Added to be safe
  // Added to be safe
];

// 2. MIDDLEWARE (EXPRESS CORS)
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); 

// 3. Database Connection
const connectDB = require('./config/db');
connectDB();

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. API is running in degraded mode.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});



// Store online users globally
global.onlineUsers = new Map();

const normalizeQueryValue = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text || text === 'undefined' || text === 'null') return null;
  return text;
};

// client/src/pages/admin/ManageResources.tsx
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080"], // Match your frontend port[cite: 4]
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Allow fallback for better stability
});

io.on('connection', (socket) => {
  const userId = normalizeQueryValue(socket.handshake.query.userId);
  const role = normalizeQueryValue(socket.handshake.query.role);

  if (userId) {
    global.onlineUsers.set(userId, socket.id);
    console.log(`🔌 User connected: ${userId} (${role})`);

    // Join user to their own room for direct notifications
    socket.join(userId);
    console.log(`📍 User ${userId} joined personal room`);

    if (role === 'admin') {
      socket.join('admins');
      console.log(`🛡️ User ${userId} joined Admin Room`);
    } else if (role === 'student') {
      socket.join('students');
      console.log(`👨‍🎓 User ${userId} joined Student Room`);
    }
  }

  socket.on('disconnect', () => {
    if (userId) {
        global.onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
    }
  });
});

// Make io accessible in routes
app.set('io', io);

// 5. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/drives', require('./routes/driveRoutes')); 
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/test', require('./routes/testEmailRoutes'));
app.use('/api/ai', require('./routes/aiRoutes')); 
// Add this near your other routes
app.use('/api/resources', require('./routes/resourceRoutes'));
// 6. Start Server
const basePort = Number(process.env.PORT || 5002);

const canUsePort = (port) => {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
};

const findAvailablePort = async (startPort, maxChecks = 10) => {
  for (let i = 0; i < maxChecks; i += 1) {
    const candidate = startPort + i;
    // eslint-disable-next-line no-await-in-loop
    const available = await canUsePort(candidate);
    if (available) {
      if (i > 0) {
        console.warn(`⚠️ Port ${startPort} is busy. Using ${candidate} instead.`);
      }
      return candidate;
    }
  }

  throw new Error(`No free port found in range ${startPort}-${startPort + maxChecks - 1}`);
};

const startServer = async () => {
  try {
    const port = await findAvailablePort(basePort);
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();