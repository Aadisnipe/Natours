const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

//new way
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',

    success_url: `${req.protocol}://${req.get('host')}/my-tour`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Send session
  res.status(200).json({
    status: 'success',
    session,
  });
});

//old way
// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   //get the currently booked tour
//   const tour = await Tour.findById(req.params.tourId);
//   //create checkout session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${req.protocol}://${req.get('host')}/`,
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.tourId,
//     line_items: [
//       {
//         name: `${tour.name} Tour`,
//         description: tour.summary,
//         images: [`https://natours.dev/img/tours/${tour.imageCover}`],
//         amount: tour.price * 100,
//         currency: 'usd',
//         quantity: 1,
//       },
//     ],
//   });
//   //create session as response
//   res.status(200).json({
//     status: 'success',
//     session,
//   });
// });

// exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) {
//     return next();
//   }
//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckOut = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;

  await Booking.create({ tour, user, price });
};

exports.webHookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error}`);
  }
  if (event.type === 'checkout.session.completed') {
    await createBookingCheckOut(event.data.object);
  }
  res.status(200).json({ received: true });
};

exports.createBooking = Factory.createOne(Booking);
exports.getBooking = Factory.getOne(Booking);
exports.getAllBooking = Factory.getAll(Booking);
exports.updateBoooking = Factory.updateOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);
