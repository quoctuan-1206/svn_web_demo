const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/uploadMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', optionalAuth, productController.list);
router.get('/:id', optionalAuth, productController.getById);

router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
      next();
    });
  },
  productController.create,
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
  productController.update,
);

router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;
