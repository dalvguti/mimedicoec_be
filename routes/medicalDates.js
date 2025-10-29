const express = require('express');
const router = express.Router();
const medicalDatesController = require('../controllers/medicalDatesController');
const { protect } = require('../middleware/auth');

router.get('/', protect, medicalDatesController.getAll);
router.get('/:id', protect, medicalDatesController.getById);
router.post('/', protect, medicalDatesController.create);
router.put('/:id', protect, medicalDatesController.update);
router.delete('/:id', protect, medicalDatesController.delete);

module.exports = router;

