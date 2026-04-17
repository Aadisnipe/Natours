const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handlejsonWebTokenValidation = () =>
  new AppError('Invalid Token. Please log in again', 401);

const handleDuplicateKeysDB = (err) => {
  const value = err.errmsg.match(/\{([^}]*)\}/);
  const message = `Duplicate ${value[1]}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtExpiry = () =>
  new AppError('Your Token has Expired. Please login again', 401);

const sendErroDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // For Render
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong !!',
      msg: err.message,
    });
  }
};

const sendErroProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('Error 💥💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong !!!',
    });
  }
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong !!',
      msg: err.message,
    });
  } else {
    console.error('Error 💥💥', err);
    res.status(500).render('error', {
      title: 'Something Went Wrong !!',
      msg: '',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErroDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateKeysDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handlejsonWebTokenValidation();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJwtExpiry();
    }
    sendErroProd(error, req, res);
  }
};
