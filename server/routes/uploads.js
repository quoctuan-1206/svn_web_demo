const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const authMiddleware = require('../middleware/authMiddleware');
const { arrayImages } = require('../middleware/handleUpload');
const upload = require('../middleware/uploadMiddleware');
const cloudinaryService = require('../services/cloudinaryService');
const { unlinkUploadedImage } = require('../utils/uploadUtils');

const router = express.Router();
const MAX_FILES = 20;
const MAX_LIST = 500;

function requireCloudinary() {
  if (!cloudinaryService.isConfigured()) {
    throw httpError(
      503,
      'CLOUDINARY_URL chưa cấu hình. Thêm biến môi trường Cloudinary trên server.',
    );
  }
}

router.get(
  '/images',
  authMiddleware,
  asyncHandler(async (req, res) => {
    requireCloudinary();

    const limit = Math.min(MAX_LIST, Math.max(1, parseInt(req.query?.limit, 10) || 200));
    const offset = Math.max(0, parseInt(req.query?.offset, 10) || 0);
    const { items, total } = await cloudinaryService.listImages({ limit, offset });
    res.json({ items, total });
  }),
);

router.post(
  '/images',
  authMiddleware,
  ...arrayImages('images', MAX_FILES),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      throw httpError(
        400,
        'Không nhận được file ảnh. Gửi multipart với field tên "images" (có thể nhiều file).',
      );
    }

    const urls = files.map((file) => upload.resolveUploadedImageUrl(file)).filter(Boolean);
    if (!urls.length) {
      throw httpError(500, 'Upload lên Cloudinary thất bại');
    }

    res.status(201).json({ urls });
  }),
);

router.post(
  '/cleanup',
  authMiddleware,
  asyncHandler(async (req, res) => {
    requireCloudinary();

    const urls = Array.isArray(req.body?.urls) ? req.body.urls : [];
    if (!urls.length) throw httpError(400, 'urls is required');
    if (urls.length > 50) throw httpError(400, 'too many urls');

    await Promise.all(
      urls.map((url) =>
        unlinkUploadedImage({ uploadDir: upload.UPLOAD_DIR, imageUrl: url }),
      ),
    );

    res.json({ removed: urls.length });
  }),
);

module.exports = router;
