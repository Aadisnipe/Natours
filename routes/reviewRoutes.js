const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//Router
const router = express.Router({ mergeParams: true }); //It allows a child router to access route parameters from its parent router

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview,
  );
router
  .route('/:id')
  .get(reviewController.getReviewById)
  .patch(
    authController.restrictTo('user', 'admin '),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );
module.exports = router;
