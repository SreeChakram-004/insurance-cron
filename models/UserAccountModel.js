const mongoose = require('mongoose');

const userAccountSchema = new mongoose.Schema({
  accountName: String,
});

const UserAccount = mongoose.model('UserAccount', userAccountSchema);

module.exports = UserAccount;
