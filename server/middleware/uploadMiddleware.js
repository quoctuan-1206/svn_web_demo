const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { httpError } = require('../utils/httpError');
const { publicUploadBase } = require('../config/env');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const safeName = path.basename(file.originalname);
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const okMime = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const okExt = !ext || allowedExt.includes(ext);
    // Trình duyệt thường gửi MIME đúng; Windows đôi khi gửi octet-stream nhưng có đuôi hợp lệ
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

function publicUploadUrl(filename) {
  if (!filename) return '';
  let name = String(filename).trim();
  const up = '/uploads/';
  if (name.startsWith(up)) name = name.slice(up.length);
  name = name.replace(/^uploads\//, '').replace(/^\//, '');
  // Mặc định URL tương đối: cùng origin với Vite (proxy /uploads → API) hoặc app phục vụ tĩnh + API
  const base = publicUploadBase;
  if (base) {
    const normalizedBase = String(base).replace(/\/$/, '');
    return `${normalizedBase}/${name}`;
  }
  return `/uploads/${name}`;
}

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
module.exports.publicUploadUrl = publicUploadUrl;
