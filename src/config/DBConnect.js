import mongoose from 'mongoose';
import { MONGO_URL } from './Constants.js'

const DBConnect = async() => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log(`Server connected to MongoDB`);
  } catch (err) {
    console.error('MongoDB connection error: ', err.message);
    throw err;
  }
};

export default DBConnect;