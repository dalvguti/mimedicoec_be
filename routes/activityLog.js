const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', protect, authorizeAdmin, activityLogController.getAll);
router.get('/user/:userId', protect, authorizeAdmin, activityLogController.getByUser);

module.exports = router;

