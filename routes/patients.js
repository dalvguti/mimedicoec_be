const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, patientsController.getAll);
router.get('/:id', protect, patientsController.getById);
router.post('/', protect, patientsController.create);
router.put('/:id', protect, patientsController.update);
router.delete('/:id', protect, patientsController.delete);

module.exports = router;

