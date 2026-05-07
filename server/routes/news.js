const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/uploadMiddleware');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/', optionalAuth, newsController.list);
router.get('/:id', optionalAuth, newsController.getById);

router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
      next();
    });
  },
  newsController.create,
);

router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
      next();
    });
  },
  newsController.update,
);

router.delete('/:id', authMiddleware, newsController.remove);

module.exports = router;
