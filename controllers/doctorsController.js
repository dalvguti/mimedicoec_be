const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const [doctors] = await db.query(`
      SELECT d.*, u.username, u.email as user_email, u.phone as user_phone, u.first_name, u.last_name 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [doctors] = await db.query(
      'SELECT d.*, u.username, u.email as user_email, u.phone as user_phone, u.first_name, u.last_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [id]
    );
    
    if (doctors.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, data: doctors[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create doctor
// @route   POST /api/doctors
// @access  Private
exports.create = async (req, res) => {
  try {
    const { user_id, private_number, specialization, education, experience_years, consultation_fee } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if user exists and doesn't already have a doctor profile
    const [existingDoctors] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [user_id]);
    if (existingDoctors.length > 0) {
      return res.status(400).json({ success: false, message: 'This user already has a doctor profile' });
    }

    const [result] = await db.query(
      'INSERT INTO doctors (user_id, private_number, specialization, education, experience_years, consultation_fee) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, private_number, specialization, education, experience_years, consultation_fee]
    );

    logActivity(req, 'CREATE', 'doctor', result.insertId, req.body);
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.query('UPDATE doctors SET ? WHERE id = ?', [updates, id]);
    logActivity(req, 'UPDATE', 'doctor', id, updates);
    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE doctors SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'doctor', id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

