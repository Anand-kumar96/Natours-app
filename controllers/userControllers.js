const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const User = require('../model/userModel');

//multer configuration
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     //user-userId-timestamp.extension
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();
//multer filter // to check file is image or not
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!. Please upload only images', 400), false);
  }
};
//multer middleware
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
//multer middleware
exports.uploadUserData = upload.single('photo');

//Resizing photo middleware
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

//for /me user we can use  getMe middleware => before getUser
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
// DO Not Update password with this
// Delete user =>admin only
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, 'User');
exports.updateUser = factory.updateOne(User, 'User');
exports.deleteUser = factory.deleteOne(User, 'User');

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();
//   //SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     result: users.length,
//     data: {
//       tours: users
//     }
//   });
// });

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
// updateMe means user which currently login
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1 create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update.please use /updateMyPassword route'
      )
    );
  }
  // we don't want user to change role,token etc so we filter => we just wanna update name,email
  //2 filter out the unwanted field name that are not allowed to be updated.
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  //3 Update user document
  // here we can not use save method because we need required field so we use findByIdAndUpdate
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
});

//delete by himself=>user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
