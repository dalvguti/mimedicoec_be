const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

exports.getAll = async (req, res) => {
  try {
    const [diagnoses] = await db.query('SELECT * FROM diagnoses WHERE active = TRUE ORDER BY code');
    res.json({ success: true, data: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [diagnoses] = await db.query('SELECT * FROM diagnoses WHERE id = ?', [id]);
    if (diagnoses.length === 0) return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    res.json({ success: true, data: diagnoses[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.search = async (req, res) => {
  try {
    const { query } = req.query;
    const [diagnoses] = await db.query(
      'SELECT * FROM diagnoses WHERE (code LIKE ? OR name LIKE ? OR category LIKE ?) AND active = TRUE LIMIT 50',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.json({ success: true, data: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { code, name, description, category } = req.body;
    const [result] = await db.query(
      'INSERT INTO diagnoses (code, name, description, category) VALUES (?, ?, ?, ?)',
      [code, name, description, category]
    );
    logActivity(req, 'CREATE', 'diagnosis', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, code, name, description, category } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE diagnoses SET ? WHERE id = ?', [req.body, id]);
    logActivity(req, 'UPDATE', 'diagnosis', id, req.body);
    res.json({ success: true, message: 'Diagnosis updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE diagnoses SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'diagnosis', id);
    res.json({ success: true, message: 'Diagnosis deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

