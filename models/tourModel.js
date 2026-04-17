const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
//Defining Schema

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name can not be null'], //validator
      unique: true,
      trim: true,
      maxlength: [40, 'Name cannot be more than 40 char long'],
      minlength: [10, 'Name cannot be less then 10 char long'],
      // validate: [validator.isAlpha, 'Name should only has alphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must mention its difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be among easy medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'it should be less than or equal to 5.0'],
      min: [1, 'it should be more than or equal to 1.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this val has current value passed to the pricediscont
          return val < this.price;
        },
        message:
          'priceDiscount({VALUE}) field should be smaller than current price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    images: [String], // An Array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //never show in the output only avilable in Db
    },
    startDates: [Date], // An Array of Date
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJson to specify Geospatial Data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, rattingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//virtual properties : they never get stores in Db
tourSchema.virtual('duration-Week').get(function () {
  return this.duration / 7;
});

//Virtually Populating
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Document Middleware(pre): runs before saving into the Db also know as Pre HOOK
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

/* THIS IS HOW WE DO EMBEDDING */
// tourSchema.pre('save', async function () {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

// Documnet Middleware(post) : runs after saving the document in the Db as Post HOOK
tourSchema.post('save', (doc, next) => {
  console.log('This is post--->', doc);
  next();
});

//Query MiddleWare pre: it has accesss to the query object
tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
});

tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
});

//Query Middleware post :
tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query Took : ${Date.now() - this.start} milliseconds`);
  next();
});

//Aggregation Middleware
// tourSchema.pre('aggregate', function () {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
// });

// Creating Collections(Or So called Table) with keeping schema in mind
const Tour = mongoose.model('Tour', tourSchema); //(always get converted to
//  pural so tour becmones tours in db)
module.exports = Tour;
