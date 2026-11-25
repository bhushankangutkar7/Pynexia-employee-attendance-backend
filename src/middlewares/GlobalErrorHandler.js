import { ValidationError as YupValidationError } from 'yup';
import mongoose from 'mongoose';

const globalErrorHandler = (err, req, res, next) => {
  if (!err) {
    err = new Error('Unkown Server Error');
  };

  const statusCode = err.statusCode || 500;

  // Yup validation errors
  if ( err instanceof YupValidationError ) {
    console.error(`Yup validation error: ${err.message}`);

    return res.status(400).json({
      status: 400,
      success: false,
      message: 'Bad Request! Request validation failed',
      errors: err.inner.map((error) => ({
        field: error.path,
        message: error.message,
      })),
      data: null,
    });
  };

  // Mongoose validation error
  if ( err instanceof mongoose.Error.ValidationError ) {
    console.error(`Mongoose validation error: ${err.message}`);

    return res.status(400).json({
      status: 400,
      success: false,
      message: 'Bad Request! Mongoose validation failed',
      errors: Object.values(err.errors).map((error) => ({
        field: error.path,
        message: error.message,
      })),
      data: null,
    });
  };

  // Duplicate key error (MongoDB)
  if ( err.code === 11000 ) {
    const field = Object.keys(err.keyValue || {})[0];
    const error = field
      ? `${field} already exists`
      : 'Duplicate record';
      
    console.error(`Mongoose duplicate key error: ${field} | ${error}`);
  
    return res.status(409).json({
      status: 409,
      success: false,
      message: 'Duplicate record',
      error,
      data: null
    });
  };

  // Mongoose cast error
  if ( err.name === 'CastError' ) {
    console.error(`Mongoose cast error: ${err.message}`);

    return res.status(400).json({
      status: 400,
      success: false,
      message: 'Bad Request! Invalid data format',
      data: null,
    });
  };

  // JWT errors
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    err.name === 'NotBeforeError'
  ) {
    console.error(`JWT error: ${err.message}`);

    return res.status(401).json({
      status: 401,
      success: false,
      message: 'Unauthorized! Invalid or expired authentication token',
      data: null,
    });
  };

  // Bcrypt errors
  // Bcrypt does not provide a consistent dedicated error class.
  // Unexpected bcrypt exceptions should be treated as server errors.
  if (
    err.name === 'Error' &&
    /bcrypt/i.test(err.stack || '')
  ) {
    console.error(`Bcrypt error: ${err.message}`);

    return res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal Server Error',
      data: null,
    });
  };

  console.error( err.message || 'Internal Server Error' );

  return res.status(Number(statusCode)).json({
    status: statusCode,
    success: false,
    message: statusCode && statusCode < 500
      ? err.message
      : 'Internal Server Error',
    data: null,
  });

};

export default globalErrorHandler;