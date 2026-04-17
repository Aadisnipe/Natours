const sharp = require('sharp');
const multer = require('multer');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please Upload an Image', 400), false);
  }
};
const upload = multer({
  //this save and changes the file sent using req.file also filter
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
exports.resizeTourImage = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  console.log(req.files);
  //imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 85 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});
// Get Tours by id
exports.getTourById = Factory.getOne(Tour, { path: 'reviews' });
// Get ALl Tours
exports.getAllTour = Factory.getAll(Tour);
// Post
exports.createTour = Factory.createOne(Tour);
// Update a tour
exports.updateTour = Factory.updateOne(Tour);
//DELETE a tour
exports.deleteTour = Factory.deleteOne(Tour);

// middleware of top-5-cheap
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rattingAverage,price';
  req.query.fields = 'name,price,rattingAverage,summary,difficulty';
  next();
};

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { maxGroupSize: { $lte: 10 } } },
    {
      $group: {
        _id: '$maxGroupSize',
        numTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    length: plan.length,
    data: {
      plan,
    },
  });
});
// router.route(
//   '/tours-within/:distance/center/:latlng/unit/:unit',
//   tourController.getToursWithin,
// );
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new AppError('Provide latitude and longitute in lat,lng format', 400),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log('This is tour', tours);
  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError('Provide latitude and longitute in lat,lng format', 400),
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    length: distances.length,
    data: {
      data: distances,
    },
  });
});
