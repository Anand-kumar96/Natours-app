const express = require('express');

const router = express.Router();

//all user controller
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserData,
  resizeUserPhoto
} = require('./../controllers/userControllers');

//all auth controller
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  restrictTo,
  updatePassword,
  logout
} = require('../controllers/authController');

// for password amd user
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

//Protect all Routes after this middleware =>
// we know that middleware run line by kine so it will apply all routes after it =>we can also protect each route manually but this looks good

router.use(protect);
router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserData, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

//to restrict for administrator => admin & it is also protected since protect middleware use above
router.use(restrictTo('admin'));

router.route('/').get(getAllUsers);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
