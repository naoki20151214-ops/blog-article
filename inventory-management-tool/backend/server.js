require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Check if running in Mock mode
const MOCK_MODE = process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'mock';

// Initialize Firebase or Mock
if (MOCK_MODE) {
  console.log('🔧 Starting in MOCK mode (no Firebase required)');
  const { initializeMock } = require('./config/firebase-mock');
  initializeMock();
} else {
  console.log('🔥 Starting in FIREBASE mode');
  const { initializeFirebase } = require('./config/firebase');
  initializeFirebase();
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/product'));
app.use('/api/suppliers', require('./routes/supplier'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    service: 'Inventory Management Tool API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Inventory Management Tool server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
