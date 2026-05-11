import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, getDbReadyState, UserStatus, UserRole } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const register = async (req: Request, res: Response) => {
  try {
    if (getDbReadyState() !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please check your MONGODB_URI in settings.' });
    }
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const initialStatus = role === UserRole.VOLUNTEER ? UserStatus.PENDING : UserStatus.ACTIVE;
    
    // For local DB, use create() then save(); for Mongoose, use new Model()
    let user: any;
    if (typeof User.create === 'function' && !User.modelName) {
      // Local DB
      user = User.create({ name, email, password: hashedPassword, role, status: initialStatus });
      await user.save();
    } else {
      // Mongoose
      user = new User({ name, email, password: hashedPassword, role, status: initialStatus });
      await user.save();
    }

    if (user.status === UserStatus.PENDING) {
      return res.status(201).json({ 
        message: 'Registration successful! Your account is pending admin approval.',
        pending: true
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Registration failed. Please ensure the database is connected.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (getDbReadyState() !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Please check your MONGODB_URI in settings.' });
    }
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === UserStatus.PENDING) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    if (user.status === UserStatus.REJECTED) {
      return res.status(403).json({ message: 'Your account has been rejected.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, mobile: user.mobile, address: user.address } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, mobile: user.mobile, address: user.address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, mobile, address, password } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (address !== undefined) user.address = address;
    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, mobile: user.mobile, address: user.address });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
