const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckOut,
  authController.isLoggedIN,
  viewController.getOverView,
);

router.get('/tour/:slug', authController.isLoggedIN, viewController.getTour);

// /login route
router.get('/login', authController.isLoggedIN, viewController.getLogin);

//me
router.get('/me', authController.protect, viewController.getMe);

//booked tour
router.get('/my-tour', authController.protect, viewController.getMyTours);

module.exports = router;
