// Load environment variables first
require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function updatePasswords() {
  try {
    console.log('Updating passwords...\n');

    // Hash new passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    console.log('Admin password hash:', adminPassword);
    console.log('Doctor password hash:', doctorPassword);

    // Update admin password
    await db.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [adminPassword, 'admin']
    );
    console.log('✓ Admin password updated');

    // Update doctor password
    await db.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [doctorPassword, 'doctor1']
    );
    console.log('✓ Doctor password updated');

    console.log('\n✅ All passwords updated successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin / admin123');
    console.log('Doctor: doctor1 / doctor123');

  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    process.exit(0);
  }
}

updatePasswords();

