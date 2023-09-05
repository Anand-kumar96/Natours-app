const Review = require('../model/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
//GET/tour/:touId/reviews => get all review of a particular tour

// setting tourUsedId on tour
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //from protect middleware
  next();
};
//simplified
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review, 'Review');
exports.createReview = factory.createOne(Review); // to handle create Review on Tour we use middleware
exports.updateReview = factory.updateOne(Review, 'Review');
exports.deleteReview = factory.deleteOne(Review, 'Review');

//getAllReviews
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });

// //getReviewById
// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (review) {
//     res.status(200).json({
//       status: 'success',
//       data: {
//         review
//       }
//     });
//   } else {
//     return next(new AppError('No review found for this user', 404));
//   }
// });

//create review
// exports.createReview = catchAsync(async (req, res, next) => {
//   //nested Routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id; //from protect middleware
//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview
//     }
//   });
// });

//update review
// exports.updateReview = catchAsync(async (req, res, next) => {
//   const updatedReview = await Review.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,
//       runValidators: true
//     }
//   );
//   if (!updatedReview) {
//     return next(new AppError('No review found for this user', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       updatedReview
//     }
//   });
// });

//delete Review
// exports.deleteReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findByIdAndDelete(req.params.id);
//   if (!review) {
//     return next(new AppError('No review found for this user', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });
