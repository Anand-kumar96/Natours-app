const mongoose = require('mongoose');
const validator = require('validator'); // to validate in this email
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// creating schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'] // npm package validator
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin', 'lead-guide'],
    default: 'user'
  },
  passwordChangedAt: Date,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please provide confirm password'],
    // custom validator to validate password
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password  & Confirm-Password are not the same.'
    }
  }
});

// encrypting password => documentMiddleware + bcrypt package
userSchema.pre('save', async function(next) {
  //Only run this function if password is actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //hash=>field, salt=>value for better encryption
  this.passwordConfirm = undefined;
  // since passwordConfirm not to be persisted in db it only for validation so not need to save in db
});

// updating the token expired time
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // 1 sec it take to reset pass assuming
  next();
});

// we are using query middleware so that we can find only active users IMPORTANT
userSchema.pre(/^find/, function(next) {
  this.find({ active: true });
  next();
});
// for verifying password with token // since it is instant method so it is => available  in whole user documents
// since candidate password is not encrypted so we can't compare directly
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// creating another instance method if password is changed
userSchema.methods.changesPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // 10 is base of number in string or radix parameter
    // console.log(changedTimestamp, JWTTimestamp);
    //2016 ko created(changedTimestamp) but JWTTimestamp is 2015 then password is changed
    return changedTimestamp > JWTTimestamp; // issued token is before than password changed then true means password has changed
  }
  //FALSE MEANS PASSWORD NOT CHANGED
  return false;
};

// to generate random token for resetting the password we create instance method
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // secure from hacker we have to encrypt it and update it with encrypted
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  // for 10 minutes after password expired
  // here we send user to a plain resetToken but we save encrypted resetToken for security issue so that we match further
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
// creating model
const User = mongoose.model('User', userSchema);
module.exports = User;
