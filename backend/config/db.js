const mongoose = require('mongoose');

// Fires once, right away, so you always know if the initial connection failed
// and WHY, instead of the process silently dying mid-request.
mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // fail fast (8s) instead of hanging/buffering for 10-30s
    });
  } catch (error) {
    // Log clearly but do NOT kill the whole server — this way, if the frontend
    // is mid-request when this fires, it still gets a proper JSON error response
    // instead of a dropped connection that looks like "Registration failed."
    console.error('❌ Initial MongoDB connection failed:', error.message);
    console.error('   Check that MongoDB is running and MONGO_URI in .env is correct.');
  }
};

module.exports = connectDB;
