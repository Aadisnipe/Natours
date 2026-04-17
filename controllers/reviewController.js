const Review = require('../models/reviewModel');
const Factory = require('./handlerFactory');

exports.setTourUserId = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = Factory.getAll(Review);
exports.getReviewById = Factory.getOne(Review);
exports.createReview = Factory.createOne(Review);
exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
