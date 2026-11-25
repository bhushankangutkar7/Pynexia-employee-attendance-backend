import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../config/Constants.js';

export const hashPassword = async(password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;

  } catch (err) {
    console.error(`Password hashing failed: ${err.message}`);
    throw err;
  };
};

export const comparePassword = async(password, hashedPassword) => {
  try {
    const isPassed = await bcrypt.compare(password, hashedPassword);
    return isPassed;
  } catch (err) {
    console.error(`Password comparison failed: ${err.message}`);
    throw err;
  };
};