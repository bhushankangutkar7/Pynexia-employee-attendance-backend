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
      throw err;
    };

    const decodedToken = decodeToken(token);    
    
    if (!decodedToken._id || !decodedToken.emId) {
      const err = new Error('Invalid token');
      err.statusCode = 401;
      throw err
    };

    const admin = await Employee.findOne({
      _id: decodedToken._id
    });

    if (!admin || admin.isActive !== true || admin.role !== 'admin') {
      const err = new Error('User not found or account is Inactive');
      err.statusCode = 403;
      throw err;
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