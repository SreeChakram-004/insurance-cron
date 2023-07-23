const mongoose = require('mongoose');

const policyCarrierSchema = new mongoose.Schema({
  companyName: String,
});

const PolicyCarrier = mongoose.model('PolicyCarrier', policyCarrierSchema);

module.exports = PolicyCarrier ;
