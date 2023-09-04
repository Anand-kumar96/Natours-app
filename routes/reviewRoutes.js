const express = require('express');
const {
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  createReview,
  setTourUserIds
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //to getTourUserId id
//POST/25698hcg/reviews
//GET/25698hcg/reviews => to set user id on tour setTourUserId middleware used
router.use(protect); // protect all routes
router.route('/').get(getAllReviews);
router.route('/').post(restrictTo('user'), setTourUserIds, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
