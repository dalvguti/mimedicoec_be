const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

exports.getAll = async (req, res) => {
  try {
    const [parameters] = await db.query('SELECT * FROM parameters WHERE active = TRUE ORDER BY parameter_type, display_order');
    res.json({ success: true, data: parameters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getByType = async (req, res) => {
  try {
    const { type } = req.params;
    const [parameters] = await db.query(
      'SELECT * FROM parameters WHERE parameter_type = ? AND active = TRUE ORDER BY display_order',
      [type]
    );
    res.json({ success: true, data: parameters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [parameters] = await db.query('SELECT * FROM parameters WHERE id = ?', [id]);
    if (parameters.length === 0) return res.status(404).json({ success: false, message: 'Parameter not found' });
    res.json({ success: true, data: parameters[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { parameter_type, parameter_key, parameter_value, description, display_order } = req.body;
    
    if (!parameter_type || !parameter_key) {
      return res.status(400).json({ success: false, message: 'Parameter type and key are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO parameters (parameter_type, parameter_key, parameter_value, description, display_order) VALUES (?, ?, ?, ?, ?)',
      [parameter_type, parameter_key, parameter_value, description, display_order]
    );
    
    logActivity(req, 'CREATE', 'parameter', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Parameter type and key combination already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE parameters SET ? WHERE id = ?', [req.body, id]);
    logActivity(req, 'UPDATE', 'parameter', id, req.body);
    res.json({ success: true, message: 'Parameter updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE parameters SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'parameter', id);
    res.json({ success: true, message: 'Parameter deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

