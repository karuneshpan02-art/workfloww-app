import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/routes/authRoutes';
import taskRoutes from './backend/routes/taskRoutes';
import { startCronJobs } from './backend/utils/cron';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  //const PORT = 3000;


  // Middleware
  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists
  const uploadsPath = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  app.use(
    '/uploads',
    (req, res, next) => {
      console.log(`File request: ${req.url}`);
      next();
    },
    express.static(uploadsPath)
  );

  // MongoDB Connection
  let lastDbError: string | null = null;
  let lastEmailError: string | null = null;

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in .env');
    lastDbError = 'Missing MONGODB_URI';
  } else {
    console.log('🔄 Connecting to MongoDB...');

    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log('✅ MongoDB Connected');
        lastDbError = null;
      })
      .catch((err) => {
        console.error('❌ MongoDB Error:', err);
        lastDbError = err.message || String(err);
      });
  }

  // DB Status API
  app.get('/api/db-status', (req, res) => {
    const state = mongoose.connection.readyState;

    let message = 'Disconnected';
    if (state === 1) message = 'Connected';
    else if (state === 2) message = 'Connecting';
    else if (state === 3) message = 'Disconnecting';

    res.json({
      connected: state === 1,
      message,
      error: lastDbError,
    });
  });

  // Email Status API
  app.get('/api/email-status', (req, res) => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    res.json({
      configured: !!(host && user && pass),
      error: lastEmailError,
      details: {
        host,
        user: user ? `${user.substring(0, 3)}***` : null,
        port: process.env.SMTP_PORT,
      },
    });
  });

  // Global Email Error Handler
  (global as any).setLastEmailError = (err: string | null) => {
    lastEmailError = err;
  };

  // Test Email API
  app.post('/api/test-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    try {
      const { sendEmail } = await import('./backend/utils/email');

      await sendEmail(
        email,
        'WorkFlow Test Email',
        'Test email from your app'
      );

      res.json({ message: '✅ Email sent' });
    } catch (err: any) {
      res.status(500).json({
        message: '❌ Email failed',
        error: err.message,
      });
    }
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  // Start CRON jobs
  startCronJobs();

  // Vite Middleware (SAFE MODE)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });

      app.use(vite.middlewares);
      console.log("⚡ Vite middleware attached");
    } catch (err) {
      console.log("⚠️ Vite failed, running backend only");
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start Server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();