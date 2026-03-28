// Vercel Serverless Function - Express App
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Firebase config and middleware
const { initializeFirebase } = require('../backend/config/firebase');
const { errorHandler, notFoundHandler } = require('../backend/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// Initialize Firebase
console.log('Initializing Firebase for Serverless...');
initializeFirebase();

// Routes - Import from backend
app.use('/api/products', require('../backend/routes/product'));
app.use('/api/suppliers', require('../backend/routes/supplier'));
app.use('/api/inventory', require('../backend/routes/inventory'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Serverless API is running',
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
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Export for Vercel
module.exports = app;
