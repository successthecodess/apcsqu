import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import questionRoutes from './routes/questionRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js'; 

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/questions', questionRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/insights', insightsRoutes); // Add this

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

export default app;