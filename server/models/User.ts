import mongoose, { Schema, Document } from 'mongoose';

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

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  address: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.DONOR },
  status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema);
