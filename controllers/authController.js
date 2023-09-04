/* eslint-disable no-unused-expressions */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// TOKEN GENERATE
const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// SENDING COOKIES TO BROWSER
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
  user.password = undefined; // EXCLUDING PASSWORD
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

// SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
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
  createSendToken(newUser, 201, res);
});

//LOGIN
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 CHECK EMAIL AND PASSWORD EXIST OR NOT
  if (!email || !password) {
    return next(new AppError('please provide email and password'));
  }
  //2 CHECK USER EXIST && PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) IF EVERYTHING OK THEN SEND TOKEN TO CLIENT
  createSendToken(user, 200, res);
});

// LOGOUT
exports.logout = catchAsync(async (req, res, next) => {
  // WE DON'T SEND TOKEN WE SEND DUMMY TOKEN
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
});

// PROTECT ROUTES MIDDLEWARE
// default header key=>authorization && value Bearer abcdefgh some string i.e. token
exports.protect = catchAsync(async (req, res, next) => {
  //1 GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = await req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // THIS WAY WE CAN AUTHENTICATE BY GETTING TOKEN FROM COOKIES
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in. please login to get access', 401)
    );
  }

  //2 VERIFICATION OF VALID TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //to make promise promisify => token & secret key
  // console.log(decoded);

  //3 CHECK IF USER STILL EXIST => in case user signup and user deleted there account then try to login
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to token does no longer exist.', 401)
    );
  }

  //4 IF USER CHANGED THE PASSWORD AFTER TOKEN IS ISSUED
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed the password. please log in again',
        401
      )
    );
  }
  // 5 GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  //setting to use in future => it will travel one to other middleware it used in restrictTo Middleware
  res.locals.user = currentUser; // TO GET USER IN PUG TEMPLATE
  next();
});

// isLoggedIn MIDDLEWARE => to check user is logged in or not
//only for rendered pages not for protecting and sending error
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //1 VERIFY TOKEN
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2 IF USER STILL EXIST
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //3  IF USER CHANGED THE PASSWORD AFTER TOKEN IS ISSUED
      if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next();
      }
      // 4 THERE IS A LOGGED IN USER
      res.locals.user = currentUser; // pug will get a variable user same as req get user previously
      return next();
    }
  } catch (err) {
    return next();
  }
  next(); // if not loggedIn then next
};

// RESTRICT TO MIDDLEWARE => for authorization of specific user very very important
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

// FORGOT PASSWORD
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

// RESET PASSWORD
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

//UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('You are not login. please login in', 401));
  }
  //2 check if posted currentPassword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your password is wrong', 401));
  }
  //3 if correct, then update password
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
