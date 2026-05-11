const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const contactLeadController = require('../controllers/contactLeadController');

const router = express.Router();

router.post('/', contactLeadController.create);
router.get('/', authMiddleware, contactLeadController.list);

module.exports = router;
