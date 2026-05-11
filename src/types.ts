export enum UserRole {
  DONOR = 'donor',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected'
}

export enum FoodRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COLLECTED = 'collected',
  COMPLETED = 'completed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  role: UserRole;
  status?: UserStatus;
}

export interface FoodRequest {
  _id: string;
  foodName: string;
  quantity: string;
  location: string;
  mobile: string;
  donor: { _id: string; name: string; mobile: string; email: string };
  volunteer?: { _id: string; name: string; mobile: string; email: string };
  status: FoodRequestStatus;
  peopleHelped: number;
  acceptedAt?: string;
  collectedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
