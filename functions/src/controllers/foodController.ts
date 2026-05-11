import { Request, Response } from 'express';
import { FoodRequest, FoodRequestStatus, User } from '../db';

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { foodName, quantity, location, mobile } = req.body;
    const donorId = (req as any).user.userId;

    let request: any;
    if (typeof FoodRequest.create === 'function' && !FoodRequest.modelName) {
      request = FoodRequest.create({ foodName, quantity, location, mobile, donor: donorId, status: FoodRequestStatus.PENDING });
    } else {
      request = new FoodRequest({ foodName, quantity, location, mobile, donor: donorId, status: FoodRequestStatus.PENDING });
    }
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDonorRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const donorId = (req as any).user.userId;
    const requests = await FoodRequest.find({ donor: donorId }).populate('volunteer', 'name email mobile');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await FoodRequest.find().populate('donor', 'name mobile email').populate('volunteer', 'name mobile email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    const volunteerId = (req as any).user.userId;

    const request = await FoodRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }
    if (request.status && request.status !== FoodRequestStatus.PENDING) {
      res.status(400).json({ message: 'Request already accepted or completed' });
      return;
    }

    request.volunteer = volunteerId;
    request.status = FoodRequestStatus.ACCEPTED;
    request.acceptedAt = new Date();
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId, status, peopleHelped } = req.body;
    const userId = (req as any).user.userId;

    const request = await FoodRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    const donorId = typeof request.donor === 'object' ? request.donor._id : request.donor;
    const volId = request.volunteer ? (typeof request.volunteer === 'object' ? request.volunteer._id : request.volunteer) : null;
    const userRole = (req as any).user.role;
    
    if (userRole !== 'admin' && String(donorId) !== String(userId) && (!volId || String(volId) !== String(userId))) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    if (status) {
      request.status = status as FoodRequestStatus;
      if (status === FoodRequestStatus.COLLECTED) request.collectedAt = new Date();
      if (status === FoodRequestStatus.COMPLETED) request.completedAt = new Date();
    }
    if (peopleHelped !== undefined) request.peopleHelped = peopleHelped;
    
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all completed requests from the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all requests and filter manually because localDb doesn't support $gte
    const allCompleted = await FoodRequest.find({
      status: FoodRequestStatus.COMPLETED
    }).populate('volunteer', 'name');

    const completedRequests = allCompleted.filter((req: any) => {
      if (!req.completedAt) return false;
      const completedDate = new Date(req.completedAt);
      return completedDate >= startOfMonth;
    });

    // Aggregate manually
    const volunteerStats: Record<string, { name: string, points: number }> = {};
    
    completedRequests.forEach((req: any) => {
      if (req.volunteer && req.volunteer._id) {
        const id = String(req.volunteer._id);
        if (!volunteerStats[id]) {
          volunteerStats[id] = { name: req.volunteer.name, points: 0 };
        }
        // 10 points per delivery + 1 point per person helped
        volunteerStats[id].points += 10 + (req.peopleHelped || 0);
      }
    });

    const leaderboard = Object.values(volunteerStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3); // Top 3

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
