const express = require('express');
const router = express.Router();
const parametersController = require('../controllers/parametersController');
const { protect } = require('../middleware/auth');

router.get('/', protect, parametersController.getAll);
router.get('/type/:type', protect, parametersController.getByType);
router.get('/:id', protect, parametersController.getById);
router.post('/', protect, parametersController.create);
router.put('/:id', protect, parametersController.update);
router.delete('/:id', protect, parametersController.delete);

module.exports = router;

