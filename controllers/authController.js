const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/sendEmail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: 'lax',
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  user.__v = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and Password feild can not be empty', 400));
  }

  const user = await User.findOne({ email }).select('+password'); //+ is required bcuz it is hidden by default

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is incorrect', 401));
  }
  createSendToken(user, 200, res);
});

exports.logOut = (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1)Check if token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  //2)Verify Token
  //jwt.verify runs through a callback func but we convt it into a promise obj
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)If the user still exists in the Db
  const currUser = await User.findById(decode.id);
  if (!currUser) {
    return next(
      new AppError('The user with this token no longer exists.', 401),
    );
  }
  //4)If Password is Changed
  if (currUser.correctPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401),
    );
  }
  //NOW FINAL ACCESS IS GRANTED
  req.user = currUser;
  res.locals.user = currUser;
  next();
});
// Only for rendered pages, no error handling in here
exports.isLoggedIN = async (req, res, next) => {
  try {
    //1)Check if token exist
    if (req.cookies.jwt) {
      // Verify Token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      //If the user still exists in the Db
      const currUser = await User.findById(decode.id);
      if (!currUser) {
        return next();
      }
      //4)If Password is Changed
      if (currUser.correctPasswordAfter(decode.iat)) {
        return next();
      }
      //now making this user available in all the pug templates
      res.locals.user = currUser;
      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access Forbidden', 403));
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) Get User based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No User found with this Email Id', 404));
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it to the user's mail id
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token . Valid for only 10 min',
    //   message,
    // });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your Email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an Error while sending the Email. Please try agian later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  //2)Check if token is not expired and user exsit
  if (!user) {
    return next(new AppError('Invalid Token . Or Token has Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  //3) Update changePasswordAt property for the user

  //Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get the user from the Collection
  const user = await User.findById(req.user.id).select('+password');
  //Check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Please Enter correct current password', 401));
  }
  //If so , Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //Log in send, JWT
  createSendToken(user, 200, res);
});
