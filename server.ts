import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes.ts';
import foodRoutes from './server/routes/foodRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {

  let lastDbError: string | null = null;
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
      .then(() => {
        console.log('✅ Connected to MongoDB Successfully');
        lastDbError = null;
      })
      .catch((err) => {
        lastDbError = err.message;
        console.error('❌ MongoDB Connection Failed:', err.message);
        if (err.message.includes('IP address')) {
          console.error('ACTION REQUIRED: Please whitelist IP 0.0.0.0/0 in your MongoDB Atlas Network Access settings.');
        }
      });
  } else {
    // No MongoDB URI - use local file database (set up via db.ts abstraction)
    console.log('📂 No MONGODB_URI configured — using local JSON file database');
    lastDbError = null; // Not an error, local DB works fine
  }

  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/food', foodRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    if (!MONGODB_URI) {
      // Local DB mode — always connected
      res.json({ 
        status: 'ok', 
        database: 'connected',
        mode: 'local',
        hasUri: false,
        error: null
      });
    } else {
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      res.json({ 
        status: 'ok', 
        database: states[mongoose.connection.readyState],
        mode: 'mongodb',
        hasUri: true,
        error: lastDbError
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

startServer();
