// this anonymous function is called by express=> (req, res, next) =>
const catchError = fn => {
  // catchError function return an anonymous function which is assign to create tour
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err)); // fn is async  return promises so we can apply then and catch ,method
  };
};

module.exports = catchError;
