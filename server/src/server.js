require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Import error handlers
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid friction
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Route Mounts
app.use('/api', healthRoutes); // GET /api/health
app.use('/api/auth', authRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/supplier', supplierRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Mini B2B RFQ Marketplace API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rfqs: '/api/rfqs',
      buyer: '/api/buyer',
      supplier: '/api/supplier',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] Mini B2B RFQ Marketplace server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
