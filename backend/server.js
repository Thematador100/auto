import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import inspectionRoutes from './routes/inspections.js';
import photoRoutes from './routes/photos.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import fraudRoutes from './routes/fraud.js';
import commonIssuesRoutes from './routes/commonIssues.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Trust proxy for Railway's reverse proxy
app.set('trust proxy', 1);
// Update: Default to 8080 to match Railway's expected port
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' })); // For base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Auto Inspection Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/reports', reportRoutes); // Report routes: /api/reports/email
app.use('/api/fraud', fraudRoutes); // Fraud detection: /api/fraud/analyze-odometer, /api/fraud/analyze-flood
app.use('/api/common-issues', commonIssuesRoutes); // Common issues: /api/common-issues?make=Honda&model=Civic&year=2017
app.use('/api/admin', adminRoutes); // Admin routes: /api/admin/stats, /api/admin/users (requires admin role)
app.use('/api', aiRoutes); // AI routes: /api/analyze-dtc, /api/generate-report, /api/detect-features

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AI Auto Inspection Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'all origins'}`);
  console.log(`🔐 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
});

export default app;
