import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/Constants.js';

export const generateToken = (payload) => jwt.sign(
  payload, 
  JWT_SECRET, 
  { expiresIn: JWT_EXPIRES_IN }
);

export const decodeToken = (token) => jwt.verify(token, JWT_SECRET);