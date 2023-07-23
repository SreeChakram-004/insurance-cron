const mongoose = require('mongoose');
const { Schema } = mongoose;

const policyInfoSchema = new Schema({
  policyNumber: String,
  policyStartDate: Date,
  policyEndDate: Date,
  policyCategory: { type: Schema.Types.ObjectId, ref: 'PolicyCategory' },
  collectionId: String,  
  companyCollectionId: String, 
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const PolicyInfo = mongoose.model('PolicyInfo', policyInfoSchema);

module.exports = PolicyInfo;
