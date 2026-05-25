require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  publicUploadBase: process.env.PUBLIC_UPLOAD_BASE,
};
