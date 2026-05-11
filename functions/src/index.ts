import * as functions from 'firebase-functions';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/auth', authRoutes);
app.use('/food', foodRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    res.json({ 
      status: 'ok', 
      database: 'local',
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
      error: null // Note: In functions, connection is managed differently
    });
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => {
      console.log('✅ Connected to MongoDB Successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Failed:', err.message);
    });
} else {
  console.log('📂 No MONGODB_URI configured — using local JSON file database');
}

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);