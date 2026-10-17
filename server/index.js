const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/tasks');
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.url}`);
  next();
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// API Task & Dashboard Routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Student Task Manager API is running (Multi-Student Secure Edition)',
    version: '2.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/tasks (Protected)',
      'GET /api/tasks/:id (Protected)',
      'POST /api/tasks (Protected)',
      'PUT /api/tasks/:id (Protected)',
      'DELETE /api/tasks/:id (Protected)',
      'GET /api/dashboard (Protected)',
      'GET /api/health (Public)'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Student Task Manager Server is running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
});
