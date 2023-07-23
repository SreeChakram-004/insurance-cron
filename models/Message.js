const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  content: String,
  scheduledTime: Date,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };
