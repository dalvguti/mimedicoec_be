const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const [patients] = await db.query(`
      SELECT p.*, u.username, u.email as user_email, u.phone as user_phone, u.first_name, u.last_name 
      FROM patients p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [patients] = await db.query(`
      SELECT p.*, u.username, u.email as user_email, u.phone as user_phone, u.first_name, u.last_name 
      FROM patients p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, data: patients[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create patient
// @route   POST /api/patients
// @access  Private
exports.create = async (req, res) => {
  try {
    const { user_id, dni, birth_date, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Check if user exists and doesn't already have a patient profile
    const [existingPatients] = await db.query('SELECT id FROM patients WHERE user_id = ?', [user_id]);
    if (existingPatients.length > 0) {
      return res.status(400).json({ success: false, message: 'This user already has a patient profile' });
    }

    const [result] = await db.query(
      'INSERT INTO patients (user_id, dni, birth_date, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, dni, birth_date, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes]
    );

    logActivity(req, 'CREATE', 'patient', result.insertId, req.body);

    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await db.query(
      'UPDATE patients SET ? WHERE id = ?',
      [updates, id]
    );

    logActivity(req, 'UPDATE', 'patient', id, updates);
    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE patients SET active = FALSE WHERE id = ?', [id]);
    logActivity(req, 'DELETE', 'patient', id);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
