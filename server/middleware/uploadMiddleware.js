const path = require('path');
const multer = require('multer');
const { httpError } = require('../utils/httpError');
const { publicUploadBase } = require('../config/env');

/** Chỉ phục vụ xóa ảnh legacy trên disk */
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const okMime = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const okExt = !ext || allowedExt.includes(ext);
    if (okMime && okExt) {
      cb(null, true);
      return;
    }
    if (allowedExt.includes(ext) && (file.mimetype === 'application/octet-stream' || !file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(httpError(400, 'Only JPG, PNG and WEBP images are allowed'));
  },
});

/** Chuẩn hóa URL ảnh legacy (/uploads/...) khi đọc DB — upload mới luôn qua Cloudinary */
function publicUploadUrl(filenameOrUrl) {
  if (!filenameOrUrl) return '';
  const raw = String(filenameOrUrl).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  let name = raw;
  const up = '/uploads/';
  if (name.startsWith(up)) name = name.slice(up.length);
  name = name.replace(/^uploads\//, '').replace(/^\//, '');

  const base = publicUploadBase;
  if (base) {
    const normalizedBase = String(base).replace(/\/$/, '');
    return `${normalizedBase}/${name}`;
  }
  return `/uploads/${name}`;
}

function resolveUploadedImageUrl(file) {
  if (!file) return undefined;
  return file.cloudinaryUrl;
}

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
module.exports.publicUploadUrl = publicUploadUrl;
module.exports.resolveUploadedImageUrl = resolveUploadedImageUrl;
