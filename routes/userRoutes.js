const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//Routers

const router = express.Router();

//signUp route (A special route)
router.post('/signup', authController.signUp);
//login route
router.post('/login', authController.login);
//logout route
router.get('/logout', authController.logOut);
//forgetPassword route
router.post('/forgetpassword', authController.forgetPassword);
//resetPassword route
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

//Update Password for login user
router.patch('/update-my-password', authController.updatePassword);
//Get Me
router.get('/me', userController.getMe, userController.getUserById);
//Updating Me
router.patch(
  '/update-me',
  userController.updateUserPhoto,
  userController.resizePhoto,
  userController.updateMe,
);
//Deleting Me
router.delete('/delete-me', userController.deleteMe);

router.use(authController.restrictTo('admin'));

//User Access controller for Admin
router.route('/').get(userController.getAllUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
