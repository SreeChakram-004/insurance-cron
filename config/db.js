const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true, // New option to enable automatic creation of indexes
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`ERROR: ${err}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
