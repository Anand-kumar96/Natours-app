const Booking = require('../model/bookingModel');
const Tour = require('../model/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const User = require('../model/userModel');

//ALERT
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successful! Please check you email for a confirmation. if your booking doesn't show up immediately please come back later.";
  }
  next();
};
//GET OVERVIEW
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // get top 5 tours
  req.query.limit = '5';
  req.query.sort = 'price ratingsAverage, ';
  // BUILDING QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // EXECUTING QUERY
  // to see index behavior we use explain method on query =>const doc = await features.query.explain();
  const topTours = await features.query;
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
    topTours: topTours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get data for requested tour (including review and guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'rating review user'
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name!.', 404));
  }
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});

exports.loginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});
exports.signupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'create your account'
  });
});
exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});
exports.getMyTour = catchAsync(async (req, res, next) => {
  // below step can done by virtually as we did in reviews try it
  //1 find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2 find tours with returned Id
  const toursId = await bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: toursId } });
  res.status(200).render('overview', {
    title: 'My Tours',
    showHeading: tours.length > 0,
    myBooking: true,
    tours: tours
  });
});
