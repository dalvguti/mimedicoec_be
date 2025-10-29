const db = require('../config/database');
const { logActivity } = require('../middleware/auth');

// @desc    Get all medical dates
// @route   GET /api/medical-dates
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const [dates] = await db.query('SELECT * FROM medical_dates ORDER BY created_at DESC');
    res.json({ success: true, data: dates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get medical date by ID
// @route   GET /api/medical-dates/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [dates] = await db.query('SELECT * FROM medical_dates WHERE id = ?', [id]);
    
    if (dates.length === 0) {
      return res.status(404).json({ success: false, message: 'Medical date not found' });
    }
    
    res.json({ success: true, data: dates[0] });
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
    const {
      first_name, last_name, email, phone, dni, birth_date, gender,
      address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes
    } = req.body;

    const [result] = await db.query(
      'INSERT INTO patients (first_name, last_name, email, phone, dni, birth_date, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, dni, birth_date, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, notes]
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

