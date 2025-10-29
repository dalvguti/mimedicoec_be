# MiMedico Healthcare Backend

Backend API for MiMedico Healthcare Management System built with Node.js and Express.

## Features

- **User Management**: Admin, Doctor, Staff, and Receptionist roles
- **Patient Management**: Complete patient records and information
- **Doctor Management**: Doctor profiles, specializations, and scheduling
- **Inventory Management**: Medicine and medical supplies tracking
- **Medical Dates (Appointments)**: Appointment scheduling and management
- **Clinic History**: Medical records and patient history
- **Activity Log**: Complete audit trail of all system actions

## Prerequisites

- Node.js (v14 or higher)
- MySQL Database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your database credentials:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=mimedico_db
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=24h
PORT=5000
FRONTEND_URL=http://localhost:3000
```

3. Setup the database:
```bash
npm run db:setup
```

This will create the database and all necessary tables.

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

For cPanel deployment:
```bash
npm run start:cpanel
```

## Default Credentials

After running the database setup, you can login with:

**Admin:**
- Username: `admin`
- Password: `admin123` (change this immediately in production!)

**Doctor:**
- Username: `doctor1`
- Password: `doctor123`

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Protected Endpoints (require authentication)
- `GET /api/health` - Health check
- `GET /api/users` - Get all users (Admin only)
- `GET /api/patients` - Get all patients
- `GET /api/doctors` - Get all doctors
- `GET /api/inventory` - Get inventory items
- `GET /api/medical-dates` - Get appointments
- `GET /api/clinic-history` - Get medical records
- `GET /api/activity-log` - Get activity logs (Admin only)

## Database Schema

The system includes the following tables:
- `users` - System users
- `doctors` - Doctor profiles
- `patients` - Patient information
- `inventory` - Medicine and supplies
- `medical_dates` - Appointments
- `clinic_history` - Medical records
- `activity_log` - Audit trail

## Notes

- All actions are logged in the activity_log table for audit purposes
- JWT tokens are used for authentication
- The system is ready for cPanel deployment
- HTTPS support is configured for production

