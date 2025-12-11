import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { reportsRouter } from './routes/reports.js';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For large image uploads

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/ai', aiRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
