const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

//MiddleWare
const app = express();
//setting template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Serving static file
app.use(express.static(path.join(__dirname, 'public')));
//Security HTTP header
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          'https://js.stripe.com', // ✅ Stripe
          'https://maps.googleapis.com',
          'https://maps.gstatic.com',
          'https://cdn.jsdelivr.net',
        ],

        frameSrc: [
          "'self'",
          'https://js.stripe.com', // ✅ REQUIRED for Stripe Checkout
        ],

        connectSrc: [
          "'self'",
          'ws:',
          'wss:',
          'https://api.stripe.com', // ✅ Stripe API
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'https://cdn.jsdelivr.net',
        ],

        imgSrc: [
          "'self'",
          'data:',
          'https://*.googleapis.com',
          'https://*.gstatic.com',
          'https://*.google.com',
        ],

        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],

        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  }),
); //This return a function which listen for the event
//To convert to json object
app.use(express.json({ limit: '10kb' }));
//parse cookie from req object
app.use(cookieParser());
//Data Sanitization
app.use(mongoSanitize());
//Prevent XSS
app.use(xss());
//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'rattingQuantity',
      'rattingAverage',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  }),
);

//Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Request From this Ip please try again after an hour',
});
app.use('/api', limiter);
//Global MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(compression());
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

//Mounting // they are routing middleware
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//if no route is found then only this will gonna run
app.all('*', (req, res, next) => {
  // next(err); //-----> in any middleware if you pass args to next() it gonna go staright to err middlware
  next(new AppError(`can't find ${req.originalUrl} on the server`, 404));
});

//Global Error Handler middleware
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || '500';
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(globalErrorHandler);
module.exports = app;
