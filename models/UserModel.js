const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  dob: Date,
  address: String,
  phone: String,
  state: String,
  zipCode: String,
  email: String,
  gender: String,
  userType: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
