-- Patient Wellness System Database (SQLite)
-- SQLite Database Schema with Sample Data

-- Users table (for both patients and staff authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'staff')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    date_of_birth TEXT,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    blood_group TEXT,
    height_cm REAL,
    weight_kg REAL,
    allergies TEXT,
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    department TEXT,
    specialization TEXT,
    license_number TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    staff_id INTEGER,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Health Records table
CREATE TABLE IF NOT EXISTS health_records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    staff_id INTEGER,
    record_date TEXT NOT NULL,
    record_type TEXT DEFAULT 'checkup' CHECK(record_type IN ('checkup', 'lab_result', 'diagnosis', 'prescription', 'vaccination', 'other')),
    weight_kg REAL,
    height_cm REAL,
    bmi REAL,
    blood_pressure TEXT,
    heart_rate INTEGER,
    temperature REAL,
    blood_sugar REAL,
    cholesterol REAL,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    staff_id INTEGER,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    instructions TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sender_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK(type IN ('appointment_reminder', 'checkup_reminder', 'medicine_reminder', 'report', 'hospital_message', 'general')),
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Wellness Tips table
CREATE TABLE IF NOT EXISTS wellness_tips (
    tip_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK(category IN ('nutrition', 'exercise', 'mental_health', 'sleep', 'hydration', 'general')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    staff_id INTEGER,
    report_type TEXT DEFAULT 'monthly_summary' CHECK(report_type IN ('monthly_summary', 'lab_report', 'progress_report', 'discharge_summary')),
    report_date TEXT NOT NULL,
    content TEXT,
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample Users (password: 'password123' hashed)
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
('patient1@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'Rahul Sharma', '9876543210'),
('patient2@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'Priya Patel', '9876543211'),
('patient3@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'patient', 'Amit Kumar', '9876543212'),
('staff1@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff', 'Dr. Meera Singh', '9876543213'),
('staff2@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff', 'Dr. Rajesh Gupta', '9876543214');

-- Sample Patients
INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, emergency_phone, blood_group, height_cm, weight_kg, allergies, medical_history) VALUES
(1, '1995-03-15', 'male', '123 MG Road, Mumbai', 'Sunita Sharma', '9876543220', 'O+', 175.00, 70.00, 'Penicillin', 'Mild asthma'),
(2, '1998-07-22', 'female', '456 Park Street, Delhi', 'Rajesh Patel', '9876543221', 'A+', 162.00, 55.00, 'None', 'None'),
(3, '1990-11-08', 'male', '789 Lake View, Chennai', 'Kavita Kumar', '9876543222', 'B+', 180.00, 85.00, 'Dust', 'Diabetes Type 2');

-- Sample Staff
INSERT INTO staff (user_id, department, specialization, license_number) VALUES
(4, 'General Medicine', 'Internal Medicine', 'MED2024001'),
(5, 'Cardiology', 'Cardiovascular', 'MED2024002');

-- Sample Appointments
INSERT INTO appointments (patient_id, staff_id, appointment_date, appointment_time, reason, status, notes) VALUES
(1, 4, '2026-10-05', '10:00:00', 'Regular checkup', 'approved', 'Annual physical examination'),
(2, 4, '2026-10-06', '11:30:00', 'Follow-up consultation', 'pending', 'Follow-up for blood test results'),
(3, 5, '2026-10-07', '14:00:00', 'Cardiology consultation', 'approved', 'Chest pain evaluation'),
(1, 4, '2026-09-20', '09:00:00', 'General consultation', 'completed', 'Seasonal allergies');

-- Sample Health Records
INSERT INTO health_records (patient_id, staff_id, record_date, record_type, weight_kg, height_cm, bmi, blood_pressure, heart_rate, temperature, blood_sugar, cholesterol, diagnosis, treatment, notes) VALUES
(1, 4, '2026-09-20', 'checkup', 70.00, 175.00, 22.86, '120/80', 72, 98.6, 95.00, 180.00, 'Seasonal allergies', 'Antihistamines prescribed', 'Patient in good health'),
(2, 4, '2026-09-15', 'checkup', 55.00, 162.00, 20.96, '110/70', 68, 98.4, 88.00, 165.00, 'Mild anemia', 'Iron supplements recommended', 'Follow-up in 2 months'),
(3, 5, '2026-09-10', 'checkup', 85.00, 180.00, 26.23, '140/90', 80, 98.8, 145.00, 220.00, 'Hypertension, Diabetes', 'Medication adjusted', 'Diet and exercise plan provided');

-- Sample Medicines
INSERT INTO medicines (patient_id, staff_id, medicine_name, dosage, frequency, start_date, end_date, instructions, is_active) VALUES
(1, 4, 'Cetirizine', '10mg', 'Once daily', '2026-09-20', '2026-10-20', 'Take after meals', 1),
(2, 4, 'Ferrous Sulfate', '200mg', 'Twice daily', '2026-09-15', '2026-11-15', 'Take with water', 1),
(3, 5, 'Metformin', '500mg', 'Twice daily', '2026-09-10', '2026-12-10', 'Take with meals', 1),
(3, 5, 'Amlodipine', '5mg', 'Once daily', '2026-09-10', '2026-12-10', 'Take in the morning', 1);

-- Sample Notifications
INSERT INTO notifications (user_id, sender_id, title, message, type, is_read) VALUES
(1, 4, 'Appointment Reminder', 'Your appointment with Dr. Meera Singh is scheduled for Oct 5, 2026 at 10:00 AM.', 'appointment_reminder', 0),
(1, 4, 'Checkup Reminder', 'Time for your annual health checkup. Please book an appointment.', 'checkup_reminder', 0),
(2, 4, 'Report Available', 'Your blood test report is now available. Please visit the hospital to collect it.', 'report', 0),
(3, 5, 'Medicine Reminder', 'Please take your Metformin 500mg with meals. Do not skip doses.', 'medicine_reminder', 0),
(1, 4, 'Hospital Message', 'The hospital will remain closed on Oct 2 for Gandhi Jayanti.', 'hospital_message', 1);

-- Sample Wellness Tips
INSERT INTO wellness_tips (title, content, category) VALUES
('Stay Hydrated', 'Drink at least 8 glasses of water daily to maintain proper hydration and support overall health.', 'hydration'),
('Regular Exercise', 'Engage in at least 30 minutes of moderate physical activity daily, such as walking, jogging, or yoga.', 'exercise'),
('Balanced Diet', 'Include fruits, vegetables, whole grains, and lean proteins in your daily meals for optimal nutrition.', 'nutrition'),
('Quality Sleep', 'Aim for 7-9 hours of quality sleep each night to allow your body to recover and rejuvenate.', 'sleep'),
('Stress Management', 'Practice meditation, deep breathing, or mindfulness to manage stress and improve mental health.', 'mental_health'),
('Limit Sugar Intake', 'Reduce consumption of sugary drinks and snacks to maintain healthy blood sugar levels.', 'nutrition');

-- Sample Reports
INSERT INTO reports (patient_id, staff_id, report_type, report_date, content) VALUES
(1, 4, 'monthly_summary', '2026-09-20', 'Patient shows good overall health. BMI is normal. Continue current medication.'),
(2, 4, 'lab_report', '2026-09-15', 'Blood test results show mild anemia. Hemoglobin levels slightly below normal range.'),
(3, 5, 'progress_report', '2026-09-10', 'Blood pressure and blood sugar levels are being managed with medication. Improvement noted.');
