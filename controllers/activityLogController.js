const db = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 1000');
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

