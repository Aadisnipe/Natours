const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverView = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) get the data for the requested tour (include reviews and tour guide)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no Tour With That Name', 404));
  }
  //2)Bilde template
  //3)Render template
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Me',
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //Find all booking for that user
  const bookings = await Booking.find({ user: req.user.id });
  //Find tour for all the booking
  const tourId = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourId } });
  res.status(200).render('overview', {
    title: 'Booked Tours ',
    tours,
  });
});
