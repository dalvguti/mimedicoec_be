const express = require('express');
const router = express.Router();
const diagnosesController = require('../controllers/diagnosesController');
const { protect } = require('../middleware/auth');

router.get('/', protect, diagnosesController.getAll);
router.get('/search', protect, diagnosesController.search);
router.get('/:id', protect, diagnosesController.getById);
router.post('/', protect, diagnosesController.create);
router.put('/:id', protect, diagnosesController.update);
router.delete('/:id', protect, diagnosesController.delete);

module.exports = router;

