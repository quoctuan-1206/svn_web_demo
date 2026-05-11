const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { unlinkUploadedImage } = require("../utils/uploadUtils");
const { publicUploadUrl } = upload;

const router = express.Router();
const MAX_FILES = 20;

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
