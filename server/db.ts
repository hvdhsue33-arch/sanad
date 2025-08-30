import { connectDB } from '@shared/schema';

// Connect to MongoDB
export const initializeDatabase = async () => {
  await connectDB();
};

export { connectDB };