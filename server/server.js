
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 1. Config & App Setup
dotenv.config();
const app = express();
const server = http.createServer(app);

// --- ALLOWED ORIGINS (Add your port 8080 here) ---
// --- ALLOWED ORIGINS (Robust Version) ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080", // Added to be safe
  "http://localhost:8081", // Your current port
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081"  // Added to be safe
];

// 2. MIDDLEWARE (EXPRESS CORS)
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); 

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// 4. Socket.io Setup (SOCKET CORS)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // <--- Use the same list here
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store online users globally
global.onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  const role = socket.handshake.query.role;

  if (userId) {
    global.onlineUsers.set(userId, socket.id);
    console.log(`🔌 User connected: ${userId} (${role})`);

    if (role === 'admin') {
      socket.join('admins');
      console.log(`🛡️ User ${userId} joined Admin Room`);
    }
  }

  socket.on('disconnect', () => {
    if (userId) {
        global.onlineUsers.delete(userId);
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
app.use('/api/ai', require('./routes/aiRoutes')); 

// 6. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));