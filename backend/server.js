import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './src/routes/authRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import { globalErrorHandler } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager_maitri';

// Middleware Pipeline
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Health & Info Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Practical 7: Authentication and Middleware Pipeline',
    student: 'Maitri Sheta',
    studentId: 'D25CS120',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Bearer Token required)'
      },
      tasks: {
        list: 'GET /api/tasks (Bearer Token required)',
        create: 'POST /api/tasks (Bearer Token required)',
        update: 'PUT /api/tasks/:id (Bearer Token required)',
        delete: 'DELETE /api/tasks/:id (Bearer Token required)'
      }
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Central Global Error Handler
app.use(globalErrorHandler);

// Connect to MongoDB & Start Server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✔ MongoDB Connected: ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`✔ Server running on http://localhost:${PORT}`);
      console.log(`✔ Student: Maitri Sheta (ID: D25CS120)`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

export default app;
