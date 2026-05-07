const fs = require('fs');
const path = require('path');
const multer = require('multer');

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
    const ext = path.extname(file.originalname).toLowerCase();
    const okExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    const okMime = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    if (okExt && okMime) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPG, PNG and WEBP images are allowed'));
  },
});

function publicUploadUrl(filename) {
  if (!filename) return '';
  const base =
    process.env.PUBLIC_UPLOAD_BASE ||
    `http://localhost:${process.env.PORT || 3001}/uploads`;
  const normalizedBase = base.replace(/\/$/, '');
  const name = String(filename).replace(/^uploads\//, '').replace(/^\//, '');
  return `${normalizedBase}/${name}`;
}

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
module.exports.publicUploadUrl = publicUploadUrl;
