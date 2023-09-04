const Review = require('../model/reviewModel');
const factory = require('./handlerFactory');

// setting tourUsedId on tour
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //from protect middleware
  next();
};

// ALL ENDPOINTS USING HANDLE FACTORY FUNCTION
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review, 'Review');
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review, 'Review');
exports.deleteReview = factory.deleteOne(Review, 'Review');
