const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', protect, authorizeAdmin, usersController.getAll);
router.get('/:id', protect, authorizeAdmin, usersController.getById);
router.post('/', protect, authorizeAdmin, usersController.create);
router.put('/:id', protect, authorizeAdmin, usersController.update);
router.delete('/:id', protect, authorizeAdmin, usersController.delete);

module.exports = router;

