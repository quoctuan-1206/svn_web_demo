const upload = require('./uploadMiddleware');
const cloudinaryService = require('../services/cloudinaryService');
const { httpError } = require('../utils/httpError');

function runUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

function collectUploadedFiles(req) {
  if (Array.isArray(req.files) && req.files.length) return req.files;
  if (req.file) return [req.file];
  return [];
}

async function pushFilesToCloudinary(req, _res, next) {
  if (!cloudinaryService.isConfigured()) {
    next(
      httpError(
        503,
        'CLOUDINARY_URL chưa cấu hình. Thêm biến môi trường Cloudinary trên server.',
      ),
    );
    return;
  }

  try {
    const files = collectUploadedFiles(req);
    if (files.length) {
      await cloudinaryService.uploadMulterFiles(files);
    }

    for (const file of files) {
      if (!file.cloudinaryUrl) {
        next(httpError(500, 'Upload lên Cloudinary thất bại'));
        return;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

function singleImage(field = 'image') {
  return [runUpload(upload.single(field)), pushFilesToCloudinary];
}

function arrayImages(field = 'images', maxCount = 20) {
  return [runUpload(upload.array(field, maxCount)), pushFilesToCloudinary];
}

module.exports = { singleImage, arrayImages };
