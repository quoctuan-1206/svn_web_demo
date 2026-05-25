const upload = require('./uploadMiddleware');

function runUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

function singleImage(field = 'image') {
  return runUpload(upload.single(field));
}

function arrayImages(field = 'images', maxCount = 20) {
  return runUpload(upload.array(field, maxCount));
}

module.exports = { singleImage, arrayImages };
