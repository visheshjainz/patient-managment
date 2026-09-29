<?php
require_once __DIR__ . '/../php/config.php';

$conn = getDBConnection();
$password = 'password123';
$hash = password_hash($password, PASSWORD_DEFAULT);

// Add more patients
$patients = [
    ['patient4@demo.com', 'Sneha Gupta', '9876543215', '1996-05-20', 'female', '321 Rose Garden, Pune', 'Rohit Gupta', '9876543225', 'AB+', 158.00, 52.00, 'None', 'None'],
    ['patient5@demo.com', 'Vikram Singh', '9876543216', '1992-12-10', 'male', '654 Civil Lines, Jaipur', 'Anita Singh', '9876543226', 'O-', 178.00, 75.00, 'Aspirin', 'Knee surgery 2023'],
    ['patient6@demo.com', 'Ananya Reddy', '9876543217', '1999-02-28', 'female', '987 Jubilee Hills, Hyderabad', 'Suresh Reddy', '9876543227', 'B-', 165.00, 58.00, 'None', 'Migraine'],
    ['patient7@demo.com', 'Arjun Nair', '9876543218', '1994-08-14', 'male', '147 Marine Drive, Kochi', 'Lakshmi Nair', '9876543228', 'A-', 172.00, 68.00, 'Peanuts', 'Childhood asthma'],
    ['patient8@demo.com', 'Kavya Sharma', '9876543219', '1997-11-03', 'female', '258 Salt Lake, Kolkata', 'Raj Sharma', '9876543229', 'O+', 160.00, 54.00, 'None', 'None'],
];

foreach ($patients as $p) {
    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, 'patient', ?, ?)");
    $stmt->execute([$p[0], $hash, $p[1], $p[2]]);
    $userId = $conn->lastInsertId();

    $stmt = $conn->prepare("INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact, emergency_phone, blood_group, height_cm, weight_kg, allergies, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $p[3], $p[4], $p[5], $p[6], $p[7], $p[8], $p[9], $p[10], $p[11], $p[12]]);
}

// Add more staff
$staff = [
    ['staff3@demo.com', 'Dr. Priya Mehta', '9876543230', 'Dermatology', 'Clinical Dermatology', 'MED2024003'],
    ['staff4@demo.com', 'Dr. Sanjay Verma', '9876543231', 'Orthopedics', 'Joint Replacement', 'MED2024004'],
    ['staff5@demo.com', 'Dr. Anita Desai', '9876543232', 'Pediatrics', 'Neonatal Care', 'MED2024005'],
];

foreach ($staff as $s) {
    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, 'staff', ?, ?)");
    $stmt->execute([$s[0], $hash, $s[1], $s[2]]);
    $userId = $conn->lastInsertId();

    $stmt = $conn->prepare("INSERT INTO staff (user_id, department, specialization, license_number) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $s[3], $s[4], $s[5]]);
}

// Add more appointments
$appointments = [
    [4, 4, '2026-10-08', '09:30:00', 'Skin allergy consultation', 'pending', ''],
    [5, 4, '2026-10-09', '10:00:00', 'Knee pain follow-up', 'approved', 'Post-surgery checkup'],
    [6, 5, '2026-10-10', '11:00:00', 'Migraine treatment', 'pending', ''],
    [7, 4, '2026-10-11', '14:30:00', 'Asthma checkup', 'approved', 'Regular follow-up'],
    [8, 5, '2026-10-12', '15:00:00', 'General consultation', 'pending', ''],
    [4, 4, '2026-09-25', '10:00:00', 'Dermatology checkup', 'completed', 'Skin rash treatment'],
    [6, 5, '2026-09-28', '11:30:00', 'Neurology consultation', 'completed', 'Migraine evaluation'],
];

foreach ($appointments as $a) {
    $stmt = $conn->prepare("INSERT INTO appointments (patient_id, staff_id, appointment_date, appointment_time, reason, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$a[0], $a[1], $a[2], $a[3], $a[4], $a[5], $a[6]]);
}

// Add more health records
$records = [
    [4, 4, '2026-09-25', 'checkup', 52.00, 158.00, 20.79, '118/76', 70, 98.4, 92.00, 170.00, 'Contact dermatitis', 'Topical cream prescribed', 'Avoid allergens'],
    [5, 4, '2026-09-18', 'checkup', 75.00, 178.00, 24.35, '125/82', 75, 98.6, 100.00, 190.00, 'Post-knee surgery recovery', 'Physiotherapy recommended', 'Recovery progressing well'],
    [6, 5, '2026-09-28', 'checkup', 58.00, 165.00, 21.30, '115/75', 68, 98.5, 85.00, 160.00, 'Chronic migraine', 'Preventive medication started', 'Follow-up in 1 month'],
    [7, 4, '2026-09-12', 'checkup', 68.00, 172.00, 23.15, '122/78', 72, 98.7, 98.00, 175.00, 'Asthma management', 'Inhaler technique reviewed', 'Well controlled'],
    [8, 5, '2026-09-05', 'checkup', 54.00, 160.00, 21.09, '110/70', 65, 98.3, 82.00, 155.00, 'General checkup', 'Healthy', 'No issues found'],
];

foreach ($records as $r) {
    $stmt = $conn->prepare("INSERT INTO health_records (patient_id, staff_id, record_date, record_type, weight_kg, height_cm, bmi, blood_pressure, heart_rate, temperature, blood_sugar, cholesterol, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$r[0], $r[1], $r[2], $r[3], $r[4], $r[5], $r[6], $r[7], $r[8], $r[9], $r[10], $r[11], $r[12], $r[13], $r[14]]);
}

// Add more medicines
$medicines = [
    [4, 4, 'Hydrocortisone Cream', '1%', 'Twice daily', '2026-09-25', '2026-10-25', 'Apply to affected area', 1],
    [5, 4, 'Calcium + Vitamin D3', '500mg', 'Once daily', '2026-09-18', '2026-12-18', 'Take with meals', 1],
    [6, 5, 'Propranolol', '40mg', 'Once daily', '2026-09-28', '2026-12-28', 'Take in the morning', 1],
    [7, 4, 'Budesonide Inhaler', '200mcg', 'Twice daily', '2026-09-12', '2026-12-12', 'Rinse mouth after use', 1],
    [8, 5, 'Multivitamin', '1 tablet', 'Once daily', '2026-09-05', '2026-12-05', 'Take with breakfast', 1],
];

foreach ($medicines as $m) {
    $stmt = $conn->prepare("INSERT INTO medicines (patient_id, staff_id, medicine_name, dosage, frequency, start_date, end_date, instructions, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$m[0], $m[1], $m[2], $m[3], $m[4], $m[5], $m[6], $m[7], $m[8]]);
}

// Add more notifications
$notifications = [
    [4, 4, 'Appointment Reminder', 'Your appointment with Dr. Meera Singh is scheduled for Oct 8, 2026 at 9:30 AM.', 'appointment_reminder', 0],
    [5, 4, 'Checkup Reminder', 'Your follow-up appointment for knee recovery is on Oct 9, 2026.', 'checkup_reminder', 0],
    [6, 5, 'Medicine Reminder', 'Please take your Propranolol 40mg in the morning. Do not skip doses.', 'medicine_reminder', 0],
    [7, 4, 'Report Available', 'Your asthma assessment report is now available.', 'report', 0],
    [8, 5, 'Hospital Message', 'Free health checkup camp on Oct 15, 2026. All patients are welcome.', 'hospital_message', 0],
];

foreach ($notifications as $n) {
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$n[0], $n[1], $n[2], $n[3], $n[4], $n[5]]);
}

// Add more reports
$reports = [
    [4, 4, 'monthly_summary', '2026-09-25', 'Skin condition improving with treatment. Continue current medication.'],
    [5, 4, 'progress_report', '2026-09-18', 'Knee mobility improved by 40%. Physiotherapy showing good results.'],
    [6, 5, 'lab_report', '2026-09-28', 'MRI shows no abnormalities. Migraine likely stress-related.'],
];

foreach ($reports as $r) {
    $stmt = $conn->prepare("INSERT INTO reports (patient_id, staff_id, report_type, report_date, content) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$r[0], $r[1], $r[2], $r[3], $r[4]]);
}

// Add more wellness tips
$tips = [
    ['Regular Health Checkups', 'Get a comprehensive health checkup at least once a year to detect any health issues early.', 'general'],
    ['Hand Hygiene', 'Wash your hands frequently with soap and water for at least 20 seconds to prevent infections.', 'general'],
    ['Healthy Snacking', 'Choose nuts, fruits, and yogurt over processed snacks for better nutrition.', 'nutrition'],
];

foreach ($tips as $t) {
    $stmt = $conn->prepare("INSERT INTO wellness_tips (title, content, category) VALUES (?, ?, ?)");
    $stmt->execute([$t[0], $t[1], $t[2]]);
}

echo "Additional data added successfully!\n";
echo "Total users: " . $conn->query("SELECT COUNT(*) FROM users")->fetch()[0] . "\n";
echo "Total patients: " . $conn->query("SELECT COUNT(*) FROM patients")->fetch()[0] . "\n";
echo "Total staff: " . $conn->query("SELECT COUNT(*) FROM staff")->fetch()[0] . "\n";
echo "Total appointments: " . $conn->query("SELECT COUNT(*) FROM appointments")->fetch()[0] . "\n";
echo "Total health records: " . $conn->query("SELECT COUNT(*) FROM health_records")->fetch()[0] . "\n";
echo "Total medicines: " . $conn->query("SELECT COUNT(*) FROM medicines")->fetch()[0] . "\n";
echo "Total notifications: " . $conn->query("SELECT COUNT(*) FROM notifications")->fetch()[0] . "\n";
