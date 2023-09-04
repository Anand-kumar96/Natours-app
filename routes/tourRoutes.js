const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
} = require('./../controllers/tourControllers');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//for nested Routes
//POST/25698hcg/reviews
//improved Version of nestedRoutes
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap-tours').get(aliasTopTour, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan);
//for tour WithIn given range
// tours-within?distance=233&center=-40,45&unit=km
// tours-within/233/center/-40,45/unit/km
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// to find distance between tour to start point
router.route('/distances/:latlng/unit/:unit').get(getDistances);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
