import Employee from '../models/EmployeeModel.js';
import '../models/AttendanceModel.js';
import mongoose from 'mongoose';

export const getAllEmployees = async(req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * 10;

    // const emps = await Employee.find({}).where({ isActive: true }).skip(skip).limit(limit);

    const [emps, totalEmps] = await Promise.all([
      Employee.find({}).where({ isActive: true }).skip(skip).limit(limit),
      Employee.countDocuments().where({ isActive: true }),
    ]);
    
    if (!emps.length) {
      const err = new Error('Employees not found');
      err.statusCode = 404;
      next(err);
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
    console.error(`Get employees error: ${err.message}`);
    next(err);
  };  
};

export const getEmployee = async(req, res, next) => {
  try {
    const { id } = req.params;

    if(!id) {
      const err = new Error('Bad Request! Mising Employee id');
      err.statuCode = 400;
    };

    const emp = await Employee.findOne({ emId: id }).where({ isActive: true });

    if (!emp) {
      const err = new Error('Emplyee not found');
      err.statusCode = 404;
      next(err);
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
    console.error(`Get an employee error: ${err.message}`);
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

      delete newEmployee?.id;
      delete newEmployee?.password;
      delete newEmployee?.deletedAt;
      delete newEmployee?.createdAt;
      delete newEmployee?.updatedAt;
      delete newEmployee?.__v;

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
    console.error(`Add an employee error: ${err.message}`);
    next(err);
  };
};

export const updateEmployee = async(req, res, next) => {
  try {

  } catch(err) {
    console.error(`Update an employee error: ${err.message}`);
    next(err);
  };  
};

export const checkIn = async(req, res, next) => {
  try {

  } catch(err) {
    console.error(`CheckIn employee error: ${err.message}`);
    next(err);
  };  
};

export const checkOut = async(req, res, next) => {
  try {

  } catch(err) {
    console.error(`Checkout employee error: ${err.message}`);
    next(err);
  };    
};

export const deleteEmployee = async(req, res, next) => {
  try {

  } catch(err) {
    console.error(`Delete an employee error: ${err.message}`);
    next(err);
  };    
};
