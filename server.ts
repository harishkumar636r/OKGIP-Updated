import express from 'express';
import path from 'path';

import mysqlDb from './backend/config/mysqlDb';

import authRoutes from './backend/routes/authRoutes';
import employeeRoutes from './backend/routes/employeeRoutes';
import departmentRoutes from './backend/routes/departmentRoutes';
import skillRoutes from './backend/routes/skillRoutes';
import gapRoutes from './backend/routes/gapRoutes';
import trainingRoutes from './backend/routes/trainingRoutes';
import reportRoutes from './backend/routes/reportRoutes';
import notificationRoutes from './backend/routes/notificationRoutes';
import userRoutes from './backend/routes/userRoutes';
import settingsRoutes from './backend/routes/settingsRoutes';
import aiRoutes from './backend/routes/aiRoutes';
import leaderboardRoutes from './backend/routes/leaderboardRoutes';
import badgeRoutes from './backend/routes/badgeRoutes';
import messageRoutes from './backend/routes/messageRoutes';
import leaveRoutes from './backend/routes/leaveRoutes';
import taskRoutes from './backend/routes/taskRoutes';
import assessmentRoutes from './backend/routes/assessmentRoutes';
import certificateRoutes from './backend/routes/certificateRoutes';
import auditRoutes from './backend/routes/auditRoutes';
import searchRoutes from './backend/routes/searchRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/gaps', gapRoutes);
  app.use('/api/trainings', trainingRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api/badges', badgeRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/search', searchRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'OKGIP Intelligence Platform API', timestamp: new Date().toISOString() });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    // Dynamic import: vite is ESM-only and must never be required at the top
    // of the file, or it gets pulled into the production bundle's module
    // load path and crashes (it uses import.meta.url internally, which
    // breaks under CJS interop). Loading it here means it's only touched
    // when this branch actually runs, i.e. never in production.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OKGIP] Enterprise Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OKGIP] Server initialization failed:', err);
});