const express = require('express');
const router = express.Router();
const clinicHistoryController = require('../controllers/clinicHistoryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, clinicHistoryController.getAll);
router.get('/:id', protect, clinicHistoryController.getById);
router.post('/', protect, clinicHistoryController.create);
router.put('/:id', protect, clinicHistoryController.update);
router.delete('/:id', protect, clinicHistoryController.delete);

module.exports = router;

