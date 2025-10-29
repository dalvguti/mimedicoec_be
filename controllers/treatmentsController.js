const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

exports.getAll = async (req, res) => {
  try {
    const [treatments] = await db.query('SELECT * FROM treatments WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: treatments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [treatments] = await db.query('SELECT * FROM treatments WHERE id = ?', [id]);
    if (treatments.length === 0) return res.status(404).json({ success: false, message: 'Treatment not found' });
    res.json({ success: true, data: treatments[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query('INSERT INTO treatments (name, description) VALUES (?, ?)', [name, description]);
    logActivity(req, 'CREATE', 'treatment', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, name, description } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE treatments SET ? WHERE id = ?', [req.body, id]);
    logActivity(req, 'UPDATE', 'treatment', id, req.body);
    res.json({ success: true, message: 'Treatment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE treatments SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'treatment', id);
    res.json({ success: true, message: 'Treatment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

