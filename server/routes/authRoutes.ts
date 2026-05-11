import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.patch('/update-profile', authenticate, updateProfile);

export default router;
