// Load environment variables FIRST - before any other requires
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();

// Enhanced CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`CORS Request from origin: ${origin}`);
    
    // Allow requests with no origin (like calls from Postman or mobile apps)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'https://mimedicoec.gutilopsa.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ].filter(Boolean);
    
    console.log('CORS Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Blocking origin ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth routes (public)
app.use('/api/auth', require('./routes/auth'));

// Protected routes (require authentication)
const { protect } = require('./middleware/auth');

app.use('/api/users', protect, require('./routes/users'));
app.use('/api/patients', protect, require('./routes/patients'));
app.use('/api/doctors', protect, require('./routes/doctors'));
app.use('/api/inventory', protect, require('./routes/inventory'));
app.use('/api/medical-dates', protect, require('./routes/medicalDates'));
app.use('/api/clinic-history', protect, require('./routes/clinicHistory'));
app.use('/api/activity-log', protect, require('./routes/activityLog'));
app.use('/api/symptoms', protect, require('./routes/symptoms'));
app.use('/api/treatments', protect, require('./routes/treatments'));
app.use('/api/diagnoses', protect, require('./routes/diagnoses'));
app.use('/api/parameters', protect, require('./routes/parameters'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    protocol: req.protocol,
    secure: req.secure,
    host: req.get('host'),
    environment: process.env.NODE_ENV || 'production'
  });
});

// CORS test route
app.get('/api/cors-test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CORS test successful',
    origin: req.get('origin'),
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Root route for cPanel app check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MiMedico Healthcare API',
    version: '1.0.0',
    authentication: 'JWT',
    endpoints: {
      health: '/api/health',
      // Public
      login: '/api/auth/login',
      register: '/api/auth/register',
      // Protected (require authentication)
      users: '/api/users',
      patients: '/api/patients',
      doctors: '/api/doctors',
      inventory: '/api/inventory',
      medicalDates: '/api/medical-dates',
      clinicHistory: '/api/clinic-history',
      activityLog: '/api/activity-log'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// cPanel uses a virtual port system - listen on the port provided by the environment
// or fallback to the PORT env variable
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// IMPORTANT FOR cPanel USERS:
// Most cPanel setups handle SSL/HTTPS at the Apache/nginx level via reverse proxy.
// You typically DON'T need to enable HTTPS here.
// Only enable USE_HTTPS if:
// 1. You have direct SSL certificates for your Node.js app
// 2. You're NOT using cPanel's reverse proxy
// 3. Your hosting provider specifically instructed you to handle SSL in Node.js

// Start HTTP server (required)
try {
  http.createServer(app).listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Listening on: 0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error('⚠️  Failed to start HTTP server:', error.message);
}

// Start HTTPS server (optional - usually not needed on cPanel)
if (USE_HTTPS) {
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'server.crt');
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'server.key');

  // Check if SSL certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };

      https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
        console.log(`SSL Certificate: ${certPath}`);
        console.log(`SSL Key: ${keyPath}`);
        console.log(`⚠️  Note: cPanel usually handles SSL via reverse proxy.`);
        console.log(`   Make sure this configuration doesn't conflict with cPanel's SSL setup.`);
      });
    } catch (error) {
      console.error('⚠️  Failed to start HTTPS server:', error.message);
      console.error('   Continuing with HTTP only...');
    }
  } else {
    console.warn('⚠️  HTTPS is enabled but SSL certificates not found!');
    console.warn(`Looking for:`);
    console.warn(`  - Certificate: ${certPath}`);
    console.warn(`  - Key: ${keyPath}`);
    console.warn(`Run 'npm run generate-certs' to create self-signed certificates for development`);
    console.warn(`Or disable HTTPS by removing USE_HTTPS environment variable`);
  }
} else {
  console.log('ℹ️  HTTPS is disabled (recommended for cPanel)');
  console.log('   cPanel handles SSL via reverse proxy at Apache/nginx level');
  console.log('   Set USE_HTTPS=true in environment variables if you need direct HTTPS support');
}

// Export for cPanel
module.exports = app;
