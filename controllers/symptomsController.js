const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

exports.getAll = async (req, res) => {
  try {
    const [symptoms] = await db.query('SELECT * FROM symptoms WHERE active = TRUE ORDER BY name');
    res.json({ success: true, data: symptoms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [symptoms] = await db.query('SELECT * FROM symptoms WHERE id = ?', [id]);
    if (symptoms.length === 0) return res.status(404).json({ success: false, message: 'Symptom not found' });
    res.json({ success: true, data: symptoms[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query('INSERT INTO symptoms (name, description) VALUES (?, ?)', [name, description]);
    logActivity(req, 'CREATE', 'symptom', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, name, description } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE symptoms SET ? WHERE id = ?', [req.body, id]);
    logActivity(req, 'UPDATE', 'symptom', id, req.body);
    res.json({ success: true, message: 'Symptom updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE symptoms SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'symptom', id);
    res.json({ success: true, message: 'Symptom deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

