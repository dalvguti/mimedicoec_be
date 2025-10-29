-- MiMedico Database Schema

-- Users table (for system users/admins)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  default_role ENUM('admin', 'doctor', 'staff', 'receptionist', 'patient') DEFAULT 'staff',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Roles (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT NOT NULL,
  role ENUM('admin', 'doctor', 'staff', 'receptionist', 'patient') NOT NULL,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table (medical staff) - Links to users table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  private_number VARCHAR(100) UNIQUE NOT NULL,
  specialization VARCHAR(200),
  education TEXT,
  experience_years INT,
  consultation_fee DECIMAL(10, 2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doctor_user (user_id)
);

-- Patients table - Links to users table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  dni VARCHAR(20) UNIQUE,
  birth_date DATE,
  gender ENUM('M', 'F', 'Other'),
  address TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_patient_user (user_id)
);

-- Medical Dates (Appointments)
CREATE TABLE IF NOT EXISTS medical_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  INDEX idx_date (appointment_date),
  INDEX idx_status (status)
);

-- Clinic History (Medical Records)
CREATE TABLE IF NOT EXISTS clinic_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  medical_date_id INT,
  visit_date DATETIME NOT NULL,
  chief_complaint TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  prescription TEXT,
  vital_signs JSON,
  notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (medical_date_id) REFERENCES medical_dates(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_patient (patient_id),
  INDEX idx_visit_date (visit_date)
);

-- Symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Diagnoses table (CIE-10 standard)
CREATE TABLE IF NOT EXISTS diagnoses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
);

-- Inventory table (Medicine and medical supplies)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  cost_per_unit DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  supplier VARCHAR(200),
  expiry_date DATE,
  min_stock_level INT DEFAULT 10,
  barcode VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_stock (quantity)
);

-- Prescription Items (Links clinic history with inventory)
CREATE TABLE IF NOT EXISTS prescription_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clinic_history_id INT NOT NULL,
  inventory_id INT NOT NULL,
  quantity INT NOT NULL,
  dosage VARCHAR(200),
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (clinic_history_id) REFERENCES clinic_history(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Clinic History Symptoms (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS clinic_history_symptoms (
  clinic_history_id INT NOT NULL,
  symptom_id INT NOT NULL,
  PRIMARY KEY (clinic_history_id, symptom_id),
  FOREIGN KEY (clinic_history_id) REFERENCES clinic_history(id) ON DELETE CASCADE,
  FOREIGN KEY (symptom_id) REFERENCES symptoms(id) ON DELETE CASCADE
);

-- Clinic History Treatments (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS clinic_history_treatments (
  clinic_history_id INT NOT NULL,
  treatment_id INT NOT NULL,
  PRIMARY KEY (clinic_history_id, treatment_id),
  FOREIGN KEY (clinic_history_id) REFERENCES clinic_history(id) ON DELETE CASCADE,
  FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

-- Clinic History Diagnoses (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS clinic_history_diagnoses (
  clinic_history_id INT NOT NULL,
  diagnosis_id INT NOT NULL,
  PRIMARY KEY (clinic_history_id, diagnosis_id),
  FOREIGN KEY (clinic_history_id) REFERENCES clinic_history(id) ON DELETE CASCADE,
  FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE
);

-- Parameters table (App-wide settings like blood types, etc.)
CREATE TABLE IF NOT EXISTS parameters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parameter_type VARCHAR(100) NOT NULL,
  parameter_key VARCHAR(100) NOT NULL,
  parameter_value TEXT,
  description TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_param (parameter_type, parameter_key),
  INDEX idx_type (parameter_type)
);

-- Activity Log (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO users (username, email, password, first_name, last_name, default_role) 
VALUES ('admin', 'admin@mimedico.com', '$2a$10$OjaFHRnEVRJfc63DY4USI.PjWctX8x/MNXmfuKBjjmlRJ7YbpiVGG', 'Admin', 'User', 'admin');

-- Insert sample doctor user (password: doctor123)  
-- Password hash generated with bcrypt for 'doctor123'
INSERT INTO users (username, email, password, first_name, last_name, default_role, phone, active) 
VALUES ('doctor1', 'doctor1@mimedico.com', '$2a$10$6GntKJD9HmFJcsYatIK89Oxzgon0H9iCPACBm2jpxoLGCuNNj81FW', 'John', 'Doctor', 'doctor', '0999123456', TRUE)
ON DUPLICATE KEY UPDATE username=username;

-- Insert doctor profile for doctor1 user
INSERT INTO doctors (user_id, private_number, specialization, education, experience_years, consultation_fee, active)
SELECT id, 'DOC-2024-001', 'General Medicine', 'MD, University of Medical Sciences', 10, 50.00, TRUE
FROM users WHERE username = 'doctor1'
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Insert sample CIE-10 diagnoses
INSERT INTO diagnoses (code, name, description, category) VALUES
('A00.0', 'Cholera due to Vibrio cholerae 01, biovar cholerae', 'Cholera caused by Vibrio cholerae', 'Infectious diseases'),
('E10.9', 'Type 1 diabetes mellitus without complications', 'Insulin-dependent diabetes mellitus', 'Endocrine diseases'),
('I10', 'Essential (primary) hypertension', 'High blood pressure', 'Circulatory system diseases'),
('J00', 'Acute nasopharyngitis [common cold]', 'Common cold', 'Respiratory diseases'),
('M79.3', 'Panniculitis, unspecified', 'Inflammation of subcutaneous fat', 'Musculoskeletal diseases'),
('N30.0', 'Acute cystitis', 'Acute urinary bladder infection', 'Urinary system diseases'),
('K21.9', 'Gastro-oesophageal reflux disease without oesophagitis', 'GERD', 'Digestive diseases'),
('G43.9', 'Migraine, unspecified', 'Migraine headache', 'Nervous system diseases')
ON DUPLICATE KEY UPDATE code=code;

-- Insert sample parameters (Blood types and other settings)
INSERT INTO parameters (parameter_type, parameter_key, parameter_value, description, display_order) VALUES
('blood_type', 'A+', 'A Positive', 'Blood type A positive', 1),
('blood_type', 'A-', 'A Negative', 'Blood type A negative', 2),
('blood_type', 'B+', 'B Positive', 'Blood type B positive', 3),
('blood_type', 'B-', 'B Negative', 'Blood type B negative', 4),
('blood_type', 'AB+', 'AB Positive', 'Blood type AB positive', 5),
('blood_type', 'AB-', 'AB Negative', 'Blood type AB negative', 6),
('blood_type', 'O+', 'O Positive', 'Blood type O positive', 7),
('blood_type', 'O-', 'O Negative', 'Blood type O negative', 8),
('gender', 'M', 'Male', 'Male gender', 1),
('gender', 'F', 'Female', 'Female gender', 2),
('gender', 'Other', 'Other', 'Other gender', 3)
ON DUPLICATE KEY UPDATE parameter_value=VALUES(parameter_value);

