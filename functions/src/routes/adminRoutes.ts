import { Router } from 'express';
import { getStats, getAllUsers, deleteRequest, getDonors, getVolunteers, updateRequestStatus, updateVolunteerStatus } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticate, authorize(['admin']), getStats);
router.get('/users', authenticate, authorize(['admin']), getAllUsers);
router.get('/donors', authenticate, authorize(['admin']), getDonors);
router.get('/volunteers', authenticate, authorize(['admin']), getVolunteers);
router.patch('/volunteers/:userId/status', authenticate, authorize(['admin']), updateVolunteerStatus);
router.patch('/request/:requestId/status', authenticate, authorize(['admin']), updateRequestStatus);
router.delete('/request/:requestId', authenticate, authorize(['admin']), deleteRequest);

export default router;
