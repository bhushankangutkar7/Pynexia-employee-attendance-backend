import Employee from '../models/EmployeeModel.js';
import Attendance from '../models/AttendanceModel.js';
import mongoose from 'mongoose';
import systemClock from '../utils/SystemClock.js';

export const getAllEmployees = async(req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * 10;

    const [emps, totalEmps] = await Promise.all([
      Employee.find({ isActive: true }).skip(skip).limit(limit),
      Employee.countDocuments().where({ isActive: true }),
    ]);
    
    if (!emps.length) {
      const err = new Error('Employees not found');
      err.statusCode = 404;
      throw err;
    };

    const empsRes = emps.map(emp => ({
      _id: emp._id,
      emId: emp.emId,
      email: emp.email,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      isActive: emp.isActive,
      role: emp.role
    }));

    const totalPages = Math.ceil(totalEmps/limit);
    
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Fetched all employees successfully',
      data: empsRes,
      pagination: {
        currentPage: page,
        limit: limit,
        totalPages: totalPages,
        totalEmployees: totalEmps,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch(err) {
    console.error(`Get employees error: ${err.name} - ${err.message}`);
    next(err);
  };  
};

export const getEmployee = async(req, res, next) => {
  try {
    const { id } = req.params;
    const emId = Number(id);

    if(!Number.isSafeInteger(emId) || emId <=0 ) {
      const err = new Error('Bad Request! Invalid Employee id');
      err.statuCode = 400;
      throw err;
    };

    const emp = await Employee.findOne({ emId: id, isActive: true });

    if (!emp) {
      const err = new Error('Emplyee not found');
      err.statusCode = 404;
      throw err;
    };

    const empObject = {
      _id: emp._id,
      emId: emp.emId,
      email: emp.email,
      firstName: emp.firstName,
      lastName: emp.lastName,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      isActive: emp.isActive,
      role: emp.role
    }

    return res.status(200).json({
      status: 200,
      succes: true,
      message: "Employee fetched successfully",
      data: empObject,
    });

  } catch(err) {
    console.error(`Get an employee error: ${err.name} - ${err.message}`);
    next(err);
  };
};

export const addEmployee = async(req, res, next) => {
  
  const session = await mongoose.startSession();

  try {
    const { email, firstName, lastName, department, designation, joiningDate } = req.body;

    if (!email || !firstName || !lastName || !department || !designation || !joiningDate) {
      const err = new Error("Bad request!, Missing data");
      err.statusCode = 400;
      throw err;
    };

    const employee = await session.withTransaction(async () => {
      
      const newEmployee = new Employee({
        email,
        firstName,
        lastName,
        department,
        designation,
        joiningDate
      });

      newEmployee.$session(session);

      await newEmployee.save();

      return newEmployee;
    });

    const responseObj = {
      "_id": employee._id,
      "emId": employee.emId,
      "email": employee.email,
      "firstName": employee.firstName,
      "lastName": employee.lastName,
      "department": employee.department,
      "designation": employee.designation,
      "joiningDate": employee.joiningDate,
      "isActive": employee.isActive,
      "role": employee.role,
    }

    return res.status(201).json({
      status: 201,
      success: true,
      message: employee.role === 'admin' 
          ? "Admin created successfully"
          : "Employee created successfully",
      data: responseObj
    });

  } catch(err) {
    console.error(`Add an employee error: ${err.name} - ${err.message}`);
    next(err);
  };
};

export const updateEmployee = async(req, res, next) => {
  try {
    const { id } = req.params;
    const emId = Number(id);

    if (!Number.isSafeInteger(emId) || emId <= 0) {
      const err = new Error('Bad Request! Invalid employee id');
      err.statusCode = 400;
      throw err;
    };

    const allowedFields = [
      'email',
      'firstName',
      'lastName',
      'department',
      'designation',
      'joiningDate',
      'isActive'
    ];

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      const err = new Error('Bad Request! Employee data must be an object');
      err.statusCode = 400;
      throw err;
    };

    const invalidFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
    if (invalidFields.length) {
      const err = new Error(`Bad Request! Unsupported employee fields: ${invalidFields.join(', ')}`);
      err.statusCode = 400;
      throw err;
    };

    const updates = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined),
    );

    if (!Object.keys(updates).length) {
      const err = new Error('Bad Request! At least one employee field is required');
      err.statusCode = 400;
      throw err;
    };

    const employee = await Employee.findOneAndUpdate(
      { emId, isActive: true },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    };

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Employee updated successfully',
      data: {
        _id: employee._id,
        emId: employee.emId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        isActive: employee.isActive,
        role: employee.role,
      },
    });

  } catch(err) {
    console.error(`Update an employee error: ${err.name} - ${err.message}`);
    next(err);
  };  
};

export const checkIn = async(req, res, next) => {
  try {
    const emId = Number(req.params.id);
    if (!Number.isSafeInteger(emId) || emId <= 0) {
      const err = new Error('Bad Request! Invalid employee id');
      err.statusCode = 400;
      throw err;
    };

    const employee = await Employee.findOne({ emId, isActive: true });
    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    };

    const now = systemClock.now();
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ));

    const existingAttendance = await Attendance.findOne({ emId, date });
    if (existingAttendance) {
      const err = new Error('Employee has already checked in today');
      err.statusCode = 409;
      throw err;
    };

    const attendance = await Attendance.create({
      emId,
      date,
      checkIn: now,
      checkOut: null,
    });

    const response = {
        "_id": attendance._id,
        "AttendanceId": attendance.AttendanceId,
        "emId": attendance.emId,
        "date": attendance.date,
        "checkIn": attendance.checkIn,
        "checkOut": attendance.checkOut,
        "status": attendance.status,
    };

    return res.status(201).json({
      status: 201,
      success: true,
      message: 'Employee checked in successfully',
      data: response,
    });
  } catch(err) {
    console.error(`CheckIn employee error: ${err.name} - ${err.message}`);
    next(err);
  };  
};

export const checkOut = async(req, res, next) => {
  try {
    const emId = Number(req.params.id);
    if (!Number.isSafeInteger(emId) || emId <= 0) {
      const err = new Error('Bad Request! Invalid employee id');
      err.statusCode = 400;
      throw err;
    };

    const employee = await Employee.findOne({ emId, isActive: true });
    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    };

    const now = systemClock.now();
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ));
    const attendance = await Attendance.findOne({ emId, date });
    if (!attendance) {
      const err = new Error('Employee has not checked in today');
      err.statusCode = 409;
      throw err;
    };
    if (attendance.checkOut) {
      const err = new Error('Employee has already checked out today');
      err.statusCode = 409;
      throw err;
    };
    if (now < attendance.checkIn) {
      const err = new Error('Check-out time cannot be earlier than check-in time');
      err.statusCode = 409;
      throw err;
    };

    const updatedAttendance = await Attendance.findOneAndUpdate(
      { _id: attendance._id, checkOut: null, checkIn: { $lte: now } },
      { $set: { checkOut: now } },
      { new: true, runValidators: true },
    );
    if (!updatedAttendance) {
      const err = new Error('Employee has already checked out today');
      err.statusCode = 409;
      throw err;
    };

    const response = {
      "_id": updatedAttendance._id,
      "AttendanceId": updatedAttendance.AttendanceId,
      "emId": updatedAttendance.emId,
      "date": updatedAttendance.date,
      "checkIn": updatedAttendance.checkIn,
      "checkOut": updatedAttendance.checkOut,
      "status": updatedAttendance.status,
    };

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Employee checked out successfully',
      data: response,
    });
  } catch(err) {
    console.error(`Checkout employee error: ${err.name} - ${err.message}`);
    next(err);
  };    
};

export const deleteEmployee = async(req, res, next) => {
  try {
    const emId = Number(req.params.id);
    if (!Number.isSafeInteger(emId) || emId <= 1) {
      const err = new Error('Bad Request! Invalid employee id');
      err.statusCode = 400;
      throw err;
    };

    const employee = await Employee.findOneAndUpdate(
      { emId, isActive: true },
      { $set: { isActive: false, deletedAt: systemClock.now() } },
      { new: true },
    );
    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    };

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Employee deleted successfully',
      data: {
        emId: employee.emId,
        isActive: employee.isActive,
      },
    });
  } catch(err) {
    console.error(`Delete an employee error: ${err.name} - ${err.message}`);
    next(err);
  };    
};

export const getEmployeeAttendance = async(req, res, next) => {
  try {
    const emId = Number(req.params.id);
    if (!Number.isSafeInteger(emId) || emId <= 0) {
      const err = new Error('Bad Request! Invalid employee id');
      err.statusCode = 400;
      throw err;
    };

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    if (!Number.isSafeInteger(page) || page < 1 ||
        !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      const err = new Error('Bad Request! Page must be positive and limit must be between 1 and 100');
      err.statusCode = 400;
      throw err;
    };

    const skip = (page - 1) * limit;

    const employee = await Employee.findOne({ emId, isActive: true });
    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    };

    const filter = { emId };
    const [attendanceRecords, totalRecords] = await Promise.all([
      Attendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Employee attendance fetched successfully',
      data: {
        employee: {
          emId: employee.emId,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          designation: employee.designation,
          role: employee.role,
        },
        attendance: attendanceRecords.map((record) => ({
          AttendanceId: record.AttendanceId,
          emId: record.emId,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          status: record.status,
        })),
      },
      attendancePagination: {
        currentPage: page,
        limit,
        totalPages,
        totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch(err) {
    console.error(`Get employee attendance error: ${err.name} - ${err.message}`);
    next(err);
  };
};
