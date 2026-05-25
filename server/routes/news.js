const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const { singleImage } = require('../middleware/handleUpload');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/', optionalAuth, newsController.list);
router.get('/:id', optionalAuth, newsController.getById);

router.post('/', authMiddleware, singleImage('image'), newsController.create);
router.put('/:id', authMiddleware, singleImage('image'), newsController.update);
router.delete('/:id', authMiddleware, newsController.remove);

module.exports = router;
