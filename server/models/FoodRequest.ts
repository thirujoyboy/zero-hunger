import mongoose, { Schema, Document } from 'mongoose';

export enum FoodRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COLLECTED = 'collected',
  COMPLETED = 'completed'
}

export interface IFoodRequest extends Document {
  foodName: string;
  quantity: string;
  location: string;
  mobile: string;
  donor: mongoose.Types.ObjectId;
  volunteer?: mongoose.Types.ObjectId;
  status: FoodRequestStatus;
  peopleHelped: number;
  acceptedAt?: Date;
  collectedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const foodRequestSchema = new Schema<IFoodRequest>({
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  location: { type: String, required: true },
  mobile: { type: String, required: true },
  donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  volunteer: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: Object.values(FoodRequestStatus), default: FoodRequestStatus.PENDING },
  peopleHelped: { type: Number, default: 0 },
  acceptedAt: { type: Date },
  collectedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

export const FoodRequest = mongoose.model<IFoodRequest>('FoodRequest', foodRequestSchema);
