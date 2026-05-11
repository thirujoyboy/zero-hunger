import { Request, Response } from 'express';
import { User, FoodRequest, UserRole, FoodRequestStatus } from '../db';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const donorCount = await User.countDocuments({ role: UserRole.DONOR });
    const volunteerCount = await User.countDocuments({ role: UserRole.VOLUNTEER });
    const requestCount = await FoodRequest.countDocuments();
    const completedCount = await FoodRequest.countDocuments({ status: FoodRequestStatus.COMPLETED });
    const collectedCount = await FoodRequest.countDocuments({ status: FoodRequestStatus.COLLECTED });
    const pendingCount = await FoodRequest.countDocuments({ status: FoodRequestStatus.PENDING });
    
    const impactData = await FoodRequest.aggregate([
      { $match: { status: FoodRequestStatus.COMPLETED } },
      { $group: { _id: null, totalPeopleHelped: { $sum: '$peopleHelped' } } }
    ]);

    const totalPeopleHelped = impactData.length > 0 ? impactData[0].totalPeopleHelped : 0;

    res.json({
      totalDonors: donorCount,
      totalVolunteers: volunteerCount,
      totalRequests: requestCount,
      completedRequests: completedCount,
      collectedRequests: collectedCount,
      pendingRequests: pendingCount,
      totalPeopleHelped
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDonors = async (req: Request, res: Response): Promise<void> => {
  try {
    const donors = await User.aggregate([
      { $match: { role: UserRole.DONOR } },
      {
        $lookup: {
          from: 'foodrequests',
          localField: '_id',
          foreignField: 'donor',
          as: 'allDonations'
        }
      },
    ]);
    // Manually add donationCount for the frontend
    const results = donors.map((d: any) => ({
      ...d,
      donationCount: d.allDonations ? d.allDonations.length : 0
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getVolunteers = async (req: Request, res: Response): Promise<void> => {
  try {
    const volunteers = await User.aggregate([
      { $match: { role: UserRole.VOLUNTEER } },
      {
        $lookup: {
          from: 'foodrequests',
          localField: '_id',
          foreignField: 'volunteer',
          as: 'deliveries'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          mobile: 1,
          address: 1,
          status: 1,
          createdAt: 1,
          deliveryCount: { $size: '$deliveries' }
        }
      }
    ]);
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateVolunteerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.role !== UserRole.VOLUNTEER) {
      res.status(400).json({ message: 'User is not a volunteer' });
      return;
    }

    user.status = status;
    await user.save();
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { status, peopleHelped } = req.body;
    const request = await FoodRequest.findById(requestId);
    if (!request) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    if (status) {
      request.status = status as FoodRequestStatus;
      if (status === FoodRequestStatus.ACCEPTED && !request.acceptedAt) request.acceptedAt = new Date();
      if (status === FoodRequestStatus.COLLECTED && !request.collectedAt) request.collectedAt = new Date();
      if (status === FoodRequestStatus.COMPLETED && !request.completedAt) request.completedAt = new Date();
    }
    if (peopleHelped !== undefined) request.peopleHelped = peopleHelped;
    
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    await FoodRequest.findByIdAndDelete(requestId);
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
