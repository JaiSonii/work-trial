const express = require('express');
const cors = require('cors');
const loadRoutes = require('./src/routers/loadRoutes');
const customerRoutes = require('./src/routers/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/loads', loadRoutes);
app.use('/api/customers', customerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TMS API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TMS API',
    endpoints: {
      health: '/health',
      loads: '/api/loads',
      customers: '/api/customers'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TMS API Server is running on http://localhost:${PORT}`);
  console.log(`📋 Loads API available at http://localhost:${PORT}/api/loads`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});

module.exports = app;

