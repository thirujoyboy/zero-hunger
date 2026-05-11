import { Router } from 'express';
import { createRequest, getDonorRequests, getAllRequests, acceptRequest, updateStatus, getLeaderboard } from '../controllers/foodController.ts';
import { authenticate, authorize } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/', authenticate, authorize(['donor']), createRequest);
router.get('/my-requests', authenticate, authorize(['donor']), getDonorRequests);
router.get('/all', authenticate, authorize(['volunteer', 'admin']), getAllRequests);
router.get('/leaderboard', authenticate, getLeaderboard);
router.post('/accept', authenticate, authorize(['volunteer']), acceptRequest);
router.patch('/status', authenticate, updateStatus);

export default router;
