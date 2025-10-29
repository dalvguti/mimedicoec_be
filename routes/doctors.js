const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctorsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, doctorsController.getAll);
router.get('/:id', protect, doctorsController.getById);
router.post('/', protect, doctorsController.create);
router.put('/:id', protect, doctorsController.update);
router.delete('/:id', protect, doctorsController.delete);

module.exports = router;

