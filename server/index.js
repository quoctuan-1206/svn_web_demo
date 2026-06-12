require('./config/env');
const mongoose = require("mongoose");
const app = require("./app");
const { mongoUri } = require("./config/env");
const cloudinaryService = require("./services/cloudinaryService");
const PORT = process.env.PORT || 3000;

async function start() {
  if (!mongoUri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  if (!cloudinaryService.isConfigured()) {
    console.warn(
      "[upload] CLOUDINARY_URL chưa cấu hình — admin không thể upload ảnh.",
    );
  } else {
    console.log("[upload] Cloudinary enabled (folder: svn-automation)");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

start();
