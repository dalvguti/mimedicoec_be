const express = require('express');
const router = express.Router();
const symptomsController = require('../controllers/symptomsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, symptomsController.getAll);
router.get('/:id', protect, symptomsController.getById);
router.post('/', protect, symptomsController.create);
router.put('/:id', protect, symptomsController.update);
router.delete('/:id', protect, symptomsController.delete);

module.exports = router;

