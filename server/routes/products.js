const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const { singleImage } = require('../middleware/handleUpload');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', optionalAuth, productController.list);
router.get('/:id', optionalAuth, productController.getById);

router.post('/', authMiddleware, ...singleImage('image'), productController.create);
router.put('/:id', authMiddleware, ...singleImage('image'), productController.update);
router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;
