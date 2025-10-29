const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

// @desc    Get all users
exports.getAll = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, first_name, last_name, phone, default_role, active FROM users ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await db.query('SELECT id, username, email, first_name, last_name, phone, default_role, active FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create user
exports.create = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, default_role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, default_role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, first_name, last_name, phone, default_role || 'staff']
    );
    logActivity(req, 'CREATE', 'user', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.query('UPDATE users SET ? WHERE id = ?', [updates, id]);
    logActivity(req, 'UPDATE', 'user', id, updates);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'user', id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

