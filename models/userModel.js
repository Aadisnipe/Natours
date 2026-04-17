const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name , email , photo , password , passwordconfirm

//Defining Schema object

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name Field can't be Empty"],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Enter a correct Email Address'],
    required: [true, "email field can't be empty"],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, "Password can't be empty"],
    minLength: [8, 'Must be 8 Character Long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Must confirm your password'],
    validate: {
      //this only work on create and save
      validator: function (val) {
        return val === this.password;
      },
      message: 'Re-enter The same password',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//this middleware run before saving the document in the Db
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangeAt = Date.now() - 1000; //put a delay so JWT created after password change
});

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});
//Instance method available on all the docs of a collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.correctPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    return jwtTimeStamp < changeTimeStamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //Reset Token
  this.passwordResetToken = crypto //this is stored in the Db (Hased one)
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken; // this will be sent to the user (unhased one)
};
const User = mongoose.model('User', userSchema);

module.exports = User;
