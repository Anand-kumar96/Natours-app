const express = require('express');
const {
  getOverview,
  getTour,
  loginForm,
  getAccount,
  signupForm,
  getMyTour
} = require('../controllers/viewController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();
router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, loginForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTour);
router.get('/signup', isLoggedIn, signupForm);
// router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
