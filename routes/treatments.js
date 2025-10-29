const express = require('express');
const router = express.Router();
const treatmentsController = require('../controllers/treatmentsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, treatmentsController.getAll);
router.get('/:id', protect, treatmentsController.getById);
router.post('/', protect, treatmentsController.create);
router.put('/:id', protect, treatmentsController.update);
router.delete('/:id', protect, treatmentsController.delete);

module.exports = router;

