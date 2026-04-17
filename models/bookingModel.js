const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking can not be created without a valid tour id'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking can not be created without a valid user id'],
    },
    price: {
      type: Number,
      required: [true, 'A booking must mention a price'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
bookingSchema.pre(/^find/, function () {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
});
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
