const sharp = require('sharp');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extn = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extn}`);
//   },
// });

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

exports.updateUserPhoto = upload.single('photo');

exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 85 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//Updating Current User Data
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Throw Error if user try to to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for Updating password use /update-my-password',
        400,
      ),
    );
  }
  //2)Else Update User Document
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});
//Get Me
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
//Deleting Current User
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

//Get User By Id
exports.getUserById = Factory.getOne(User);
//Get ALl USER
exports.getAllUser = Factory.getAll(User);
//Update a User //NEVER UPDATE PASSWORD WITH THIS ROUTE
exports.updateUser = Factory.updateOne(User);
//DELETE a User
exports.deleteUser = Factory.deleteOne(User);
