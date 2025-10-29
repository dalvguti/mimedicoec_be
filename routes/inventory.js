const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, inventoryController.getAll);
router.get('/low-stock', protect, inventoryController.getLowStock);
router.get('/:id', protect, inventoryController.getById);
router.post('/', protect, inventoryController.create);
router.put('/:id', protect, inventoryController.update);
router.delete('/:id', protect, inventoryController.delete);

module.exports = router;

