// extending built in Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // since we are only going to pass error message in Error class message is only parameter that accepted
    // we already set message property so i not used this.message = this.message
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // setting property
    Error.captureStackTrace(this, this.constructor);
    //when constructor is called then this class is not populated in stack (err.stack)
  }
}
module.exports = AppError;
