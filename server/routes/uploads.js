const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { unlinkUploadedImage } = require("../utils/uploadUtils");
const { publicUploadUrl } = upload;

const router = express.Router();
const MAX_FILES = 20;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_LIST = 500;

router.get("/images", authMiddleware, async (req, res) => {
  const limit = Math.min(
    MAX_LIST,
    Math.max(1, parseInt(req.query?.limit, 10) || 200),
  );
  const offset = Math.max(0, parseInt(req.query?.offset, 10) || 0);

  let entries = [];
  try {
    entries = await fs.readdir(upload.UPLOAD_DIR, { withFileTypes: true });
  } catch (err) {
    if (err?.code !== "ENOENT") {
      return res.status(500).json({ message: "Failed to read uploads" });
    }
    return res.json({ items: [], total: 0 });
  }

  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()));

  const stats = await Promise.all(
    files.map(async (name) => {
      try {
        const stat = await fs.stat(path.join(upload.UPLOAD_DIR, name));
        return {
          name,
          size: stat.size,
          mtime: stat.mtimeMs,
          url: publicUploadUrl(name),
        };
      } catch {
        return null;
      }
    }),
  );

  const items = stats.filter(Boolean).sort((a, b) => b.mtime - a.mtime);

  return res.json({
    items: items.slice(offset, offset + limit),
    total: items.length,
  });
});

router.post(
  "/images",
  authMiddleware,
  (req, res, next) => {
    upload.array("images", MAX_FILES)(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: err.message || "Upload failed" });
      }
      next();
    });
  },
  (req, res) => {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({
        message:
          'Không nhận được file ảnh. Gửi multipart với field tên "images" (có thể nhiều file).',
      });
    }
    const urls = files.map((f) => publicUploadUrl(f.filename));
    res.status(201).json({ urls });
  },
);

router.post("/cleanup", authMiddleware, async (req, res) => {
  const urls = Array.isArray(req.body?.urls) ? req.body.urls : [];
  if (!urls.length) {
    return res.status(400).json({ message: "urls is required" });
  }
  if (urls.length > 50) {
    return res.status(400).json({ message: "too many urls" });
  }

  await Promise.all(
    urls.map((url) =>
      unlinkUploadedImage({ uploadDir: upload.UPLOAD_DIR, imageUrl: url }),
    ),
  );
  return res.json({ removed: urls.length });
});

module.exports = router;
