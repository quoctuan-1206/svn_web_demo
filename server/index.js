const mongoose = require('mongoose');
const app = require('./app');
const { port, mongoUri } = require('./config/env');

async function start() {
  if (!mongoUri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
}

start();
