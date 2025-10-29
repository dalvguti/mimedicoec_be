const db = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [records] = await db.query('SELECT * FROM clinic_history ORDER BY created_at DESC');
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [records] = await db.query('SELECT * FROM clinic_history WHERE id = ?', [req.params.id]);
    if (records.length === 0) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: records[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO clinic_history SET ?', [req.body]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    await db.query('UPDATE clinic_history SET ? WHERE id = ?', [req.body, req.params.id]);
    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM clinic_history WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

