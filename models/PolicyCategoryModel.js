const mongoose = require('mongoose');

const policyCategorySchema = new mongoose.Schema({
  categoryName: String,
});

const PolicyCategory = mongoose.model('PolicyCategory', policyCategorySchema);

module.exports = PolicyCategory;
