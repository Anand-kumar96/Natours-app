/* eslint-disable no-unused-expressions */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// token generate function
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }); //(payload,secretKey,option=>as expiresIn)
};

// sending cookies to browser
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookiesOptions.secure = true;
  }
  res.cookie('jwt', token, cookiesOptions);
  user.password = undefined; // to remove password from output to signup
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};
// signup=> creating
exports.signup = catchAsync(async (req, res, next) => {
  //const newUser = await User.create(req.body);// this me result security issue may be anyone can send extra dat in body
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
    active: req.body.active
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res); // created a method for that since we using a lot of places
  // not using next() because after sending response to server it will stop
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1 check if email and password exist=> if not exist return an error
  if (!email || !password) {
    return next(new AppError('please provide email and password'));
  }
  //2 Check if user exists && password is correct => if not exist return an error
  const user = await User.findOne({ email }).select('+password'); // since we put select false in schema so to select we do
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // console.log(user);

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
});
// protecting routes middleware => default header key=>authorization and value Bearer abcdefgh some string i.e. token
exports.protect = catchAsync(async (req, res, next) => {
  //1 getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = await req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // using this we can authenticate user send by cookies
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in. please login to get access', 401)
    );
  }

  //2 verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //to make promise promisify => token & secret key
  // console.log(decoded);

  //3 check if user still exist // in case user signup and user deleted then try to login
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to token does no longer exist.', 401)
    );
  }

  //4 if user changed the password after token is issued
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password. please log in again',
        401
      )
    );
  }
  //here we are setting user
  //GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser; //setting to use in future => it will travel one to other middleware it used in restrictTo Middleware
  res.locals.user = currentUser; // for get in pug
  next();
});

//isLoggedIn middleware is for only for rendered pages this is not for protected and no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //1 Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2 if user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //3 if user changed the password after token is issued
      if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next();
      }
      // 4 There is a logged in user
      res.locals.user = currentUser; // pug will get a variable user same as req get user previously
      return next();
    }
  } catch (err) {
    return next();
  }
  next(); // if not loggedIn then next
};

// for authorization of specific user middleware very very important
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles=>admin,lead-guide then ok else if roles=>user not okay
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You have not permission to perform this action', 403)
      );
    }
    next();
  };
};

// for password resetting
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Get user Based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user exist with this email address', 404)
    );
  }
  //2 generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //it will not validate all schema before saving

  //3 send it to user's email
  try {
    //sending email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'token sent to email'
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2 set new password if token was not expired and there is an user
  if (!user) {
    return next(new AppError('Token is invalid or has Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //3 update changedPassword for the property foe the user
  //4 log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // keep in mind for password never use findByIdAndUpdate it will not work a lot middleware
  if (!user) {
    return next(new AppError('You are not login. please login in', 401));
  }
  //2 check if posted currentPassword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is wrong', 401));
  }
  //3 if correct, then update password
  // from me if current password and updated password same then try to type different password
  if (await user.correctPassword(req.body.passwordConfirm, user.password)) {
    return next(
      new AppError(
        'Your password can not be previous password. please try another password.',
        401
      )
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // we want validation
  //4 log user in, send jwt
  createSendToken(user, 200, res);
});

// install jsonwebtoken
// jwt debugger we can see header and payload via passing token
// const correct = await user.correctPassword(password, user.password);
// not used because if user not find it will wait for user since async function
