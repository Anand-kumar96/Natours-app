const AppError = require('../utils/appError');

// INVALID DATABASE ID HANDLER
const handleCastErrorDB = err => {
  const message = `${err}`;
  return new AppError(message, 400);
};

// DUPLICATE DATABASE FIELD HANDLER
const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. please enter other name`;
  return new AppError(message, 400);
};

// HANDLING VALIDATION DATABASE ERROR =>ex:updating=>schema
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// HANDLING JWT WEB TOKEN ERROR
const handleJWTError = err => {
  const value = err.message;
  const message = `${value}. please log in again.`;
  return new AppError(message, 401);
};

// HANDLING EXPIRED TOKEN
const handleJWTExpiredError = err => {
  const message = `${err.message}. please log in again`;
  return new AppError(message, 401);
};

// DEVELOPMENT ERROR
const sendErrorDev = (err, req, res) => {
  //A API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message
    });
  }
  //B render error page =>RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

//PRODUCTION ERROR
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// GLOBAL ERROR HANDLER
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //💥💥💥💥💥 way to mark error as operational error 💥💥💥💥💥
    let error = Object.create(err); // using destructuring spread operator we are copying only properties not prototypes.
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // if token is changed to tackle
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    // token expired
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, req, res);
  }
};
