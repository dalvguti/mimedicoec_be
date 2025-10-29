const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await db.query('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
    
    res.json({ success: true, data: items[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private
exports.create = async (req, res) => {
  try {
    const { name, description, category, quantity, unit, cost_per_unit, selling_price, supplier, expiry_date, min_stock_level, barcode } = req.body;

    const [result] = await db.query(
      'INSERT INTO inventory (name, description, category, quantity, unit, cost_per_unit, selling_price, supplier, expiry_date, min_stock_level, barcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, quantity, unit, cost_per_unit, selling_price, supplier, expiry_date, min_stock_level, barcode]
    );

    logActivity(req, 'CREATE', 'inventory', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.query('UPDATE inventory SET ? WHERE id = ?', [updates, id]);
    logActivity(req, 'UPDATE', 'inventory', id, updates);
    res.json({ success: true, message: 'Inventory item updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE inventory SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'inventory', id);
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
exports.getLowStock = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM inventory WHERE quantity <= min_stock_level AND active = TRUE'
    );
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

