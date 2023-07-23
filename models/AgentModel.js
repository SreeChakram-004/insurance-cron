const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: String,
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
