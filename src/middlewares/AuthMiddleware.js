import { decodeToken } from '../utils/JWT.js';
import Employee from '../models/EmployeeModel.js';

export const isAdmin = async( req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
              ? authHeader.split(" ")[1]
              : req.headers.token;

    if (!token) {
      const err = new Error('Authentication token in missing');
      err.statusCode = 400;
      next(err);
    };

    const decodedToken = decodeToken(token);
    
    if (!decodedToken._id || !decodedToken.emId) {
      const err = new Error('Invalid token');
      err.statusCode = 401
    };

    const admin = await Employee.findOne({
      _id: decodedToken._id
    });

    if (!admin) {
      const err = new Error('User not found or account is Inactive');
      err.statusCode = 403;
      next(err);
    };

    const adminObj = admin.toObject ? admin.toObject() : admin.toJSON();

    delete adminObj.password;
    delete adminObj.deletedAt;
    delete adminObj?.id;

    req.user = adminObj;
    next();

  } catch (err) {
    console.error(`Auth Middlware error: ${err.message}`);
    next(err);
  };
};