/**
 * Database abstraction layer.
 * Exports User and FoodRequest models that work with either:
 *   - MongoDB (via Mongoose) when MONGODB_URI is set
 *   - Local JSON file storage when MONGODB_URI is not set
 */
import mongoose from 'mongoose';
import { User as MongoUser, UserRole, UserStatus } from './models/User';
import { FoodRequest as MongoFoodRequest, FoodRequestStatus } from './models/FoodRequest';
import { LocalUserModel, LocalFoodRequestModel, localDbState } from './localDb';

const useLocalDb = !process.env.MONGODB_URI;

// Re-export enums
export { UserRole, UserStatus, FoodRequestStatus };

// Export the right model depending on config
export const User: any = useLocalDb ? LocalUserModel : MongoUser;
export const FoodRequest: any = useLocalDb ? LocalFoodRequestModel : MongoFoodRequest;

// Connection state helper
export function getDbReadyState(): number {
  if (useLocalDb) return localDbState.readyState;
  return mongoose.connection.readyState;
}

export function getDbInfo(): { state: string; isLocal: boolean } {
  if (useLocalDb) {
    return { state: 'connected', isLocal: true };
  }
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return { state: states[mongoose.connection.readyState], isLocal: false };
}
