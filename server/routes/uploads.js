const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const asyncHandler = require('../utils/asyncHandler');
const { httpError } = require('../utils/httpError');
const authMiddleware = require('../middleware/authMiddleware');
const { arrayImages } = require('../middleware/handleUpload');
const upload = require('../middleware/uploadMiddleware');
const { unlinkUploadedImage } = require('../utils/uploadUtils');

const router = express.Router();
const MAX_FILES = 20;
const MAX_LIST = 500;
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

router.get(
  '/images',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const limit = Math.min(MAX_LIST, Math.max(1, parseInt(req.query?.limit, 10) || 200));
    const offset = Math.max(0, parseInt(req.query?.offset, 10) || 0);

    let entries = [];
    try {
      entries = await fs.readdir(upload.UPLOAD_DIR, { withFileTypes: true });
    } catch (err) {
      if (err?.code !== 'ENOENT') {
        throw httpError(500, 'Failed to read uploads');
      }
      return res.json({ items: [], total: 0 });
    }

    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()));

    const stats = await Promise.all(
      files.map(async (name) => {
        try {
          const stat = await fs.stat(path.join(upload.UPLOAD_DIR, name));
          return {
            name,
            size: stat.size,
            mtime: stat.mtimeMs,
            url: upload.publicUploadUrl(name),
          };
        } catch {
          return null;
        }
      }),
    );

    const items = stats.filter(Boolean).sort((a, b) => b.mtime - a.mtime);

    res.json({
      items: items.slice(offset, offset + limit),
      total: items.length,
    });
  }),
);

router.post(
  '/images',
  authMiddleware,
  arrayImages('images', MAX_FILES),
  asyncHandler(async (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      throw httpError(
        400,
        'Không nhận được file ảnh. Gửi multipart với field tên "images" (có thể nhiều file).',
      );
    }

    const urls = files.map((file) => upload.publicUploadUrl(file.filename));
    res.status(201).json({ urls });
  }),
);

router.post(
  '/cleanup',
  authMiddleware,
  asyncHandler(async (req, res) => {
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
