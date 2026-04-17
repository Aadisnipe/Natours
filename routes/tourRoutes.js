const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

//Router
const router = express.Router();

//This router will use reviewRouter if it ever encounter this route
router.use('/:tourID/reviews', reviewRouter);

//This middleware runs for only the given parameter

// router.param('id', tourController.checkID);
router
  .route('/monthty-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.monthlyPlan,
  );
router
  .route('/tour-stats')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.tourStats,
  );
router.route('/top-5-cheap').get(tourController.getAllTour); // first go to tourController.aliasTopTours
//  goes to tourController.getAllTour
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(authController.protect, tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
