const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: '../../config.env' });

const Db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(Db).then(() => {
  console.log('Database Connected Successfully');
});

const tours = JSON.parse(
  fs.readFileSync(
    '/Users/dev/Code_files/web-dev/back-end/4-natours/dev-data/data/tours.json',
    'utf-8',
  ),
);
const users = JSON.parse(
  fs.readFileSync(
    '/Users/dev/Code_files/web-dev/back-end/4-natours/dev-data/data/users.json',
    'utf-8',
  ),
);
const reviews = JSON.parse(
  fs.readFileSync(
    '/Users/dev/Code_files/web-dev/back-end/4-natours/dev-data/data/reviews.json',
    'utf-8',
  ),
);

//Import All Data
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('Data Added Successfully!!!!');
  } catch (error) {
    console.log(error);
  }
  process.exit(); //exit
};

//Delete All Data;

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('All Data Deleted 💥💥💥');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
