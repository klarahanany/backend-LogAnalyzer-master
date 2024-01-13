const mongoose = require('mongoose');

const connectToDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dispatcher';
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,  
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = connectToDB;
