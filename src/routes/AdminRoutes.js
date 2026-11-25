import express from 'express';
import { isAdmin } from '../middlewares/AuthMiddleware.js';
import {
  getAllEmployees,
  getEmployee,
  addEmployee,
  updateEmployee,
  checkIn,
  checkOut,
  deleteEmployee,
  getEmployeeAttendance,
} from '../controllers/AdminController.js';

const adminRouter = express.Router();

adminRouter.get('/', isAdmin, getAllEmployees);
adminRouter.get('/:id', isAdmin, getEmployee);
adminRouter.post('/', isAdmin, addEmployee);
adminRouter.patch('/:id', isAdmin, updateEmployee);
adminRouter.patch('/check-in/:id', isAdmin, checkIn);
adminRouter.patch('/check-out/:id', isAdmin, checkOut);
adminRouter.get('/:id/attendance', isAdmin, getEmployeeAttendance);
adminRouter.delete('/:id', isAdmin, deleteEmployee);

export default adminRouter;
