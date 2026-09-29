<?php
/**
 * Patient Wellness System - API Endpoint (SQLite)
 * Handles all backend operations via action-based requests
 */

session_start();
require_once 'config.php';

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$action = isset($input['action']) ? sanitize(getDBConnection(), $input['action']) : '';

$conn = getDBConnection();

switch ($action) {
    // ==================== AUTHENTICATION ====================
    case 'login':
        handleLogin($conn, $input);
        break;

    case 'register':
        handleRegister($conn, $input);
        break;

    case 'logout':
        handleLogout();
        break;

    case 'check_session':
        handleCheckSession();
        break;

    // ==================== PATIENT OPERATIONS ====================
    case 'get_patient_dashboard':
        handleGetPatientDashboard($conn);
        break;

    case 'get_patient_profile':
        handleGetPatientProfile($conn);
        break;

    case 'update_patient_profile':
        handleUpdatePatientProfile($conn, $input);
        break;

    case 'request_appointment':
        handleRequestAppointment($conn, $input);
        break;

    case 'get_patient_appointments':
        handleGetPatientAppointments($conn);
        break;

    case 'cancel_appointment':
        handleCancelAppointment($conn, $input);
        break;

    case 'get_health_records':
        handleGetHealthRecords($conn);
        break;

    case 'get_medicines':
        handleGetMedicines($conn);
        break;

    case 'get_wellness_tips':
        handleGetWellnessTips($conn);
        break;

    case 'get_patient_notifications':
        handleGetPatientNotifications($conn);
        break;

    case 'mark_notification_read':
        handleMarkNotificationRead($conn, $input);
        break;

    case 'mark_all_notifications_read':
        handleMarkAllNotificationsRead($conn);
        break;

    case 'get_unread_count':
        handleGetUnreadCount($conn);
        break;

    // ==================== STAFF OPERATIONS ====================
    case 'get_staff_dashboard':
        handleGetStaffDashboard($conn);
        break;

    case 'get_all_patients':
        handleGetAllPatients($conn);
        break;

    case 'search_patients':
        handleSearchPatients($conn, $input);
        break;

    case 'get_patient_details':
        handleGetPatientDetails($conn, $input);
        break;

    case 'get_all_appointments':
        handleGetAllAppointments($conn, $input);
        break;

    case 'update_appointment_status':
        handleUpdateAppointmentStatus($conn, $input);
        break;

    case 'reschedule_appointment':
        handleRescheduleAppointment($conn, $input);
        break;

    case 'add_health_record':
        handleAddHealthRecord($conn, $input);
        break;

    case 'update_health_record':
        handleUpdateHealthRecord($conn, $input);
        break;

    case 'get_patient_health_records':
        handleGetPatientHealthRecords($conn, $input);
        break;

    case 'add_medicine':
        handleAddMedicine($conn, $input);
        break;

    case 'update_medicine':
        handleUpdateMedicine($conn, $input);
        break;

    case 'get_patient_medicines':
        handleGetPatientMedicines($conn, $input);
        break;

    case 'send_notification':
        handleSendNotification($conn, $input);
        break;

    case 'get_staff_notifications':
        handleGetStaffNotifications($conn);
        break;

    case 'get_reports':
        handleGetReports($conn);
        break;

    case 'add_report':
        handleAddReport($conn, $input);
        break;

    case 'get_analytics':
        handleGetAnalytics($conn);
        break;

    default:
        sendResponse(false, 'Invalid action specified');
}

// ==================== AUTHENTICATION HANDLERS ====================

function handleLogin($conn, $input) {
    $missing = validateRequired($input, ['email', 'password']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing));
    }

    $email = sanitize($conn, $input['email']);
    $password = $input['password'];

    $stmt = $conn->prepare("SELECT user_id, email, password_hash, role, full_name FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(false, 'Invalid email or password');
    }

    if (!password_verify($password, $user['password_hash'])) {
        sendResponse(false, 'Invalid email or password');
    }

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['full_name'] = $user['full_name'];

    sendResponse(true, 'Login successful', [
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ]);
}

function handleRegister($conn, $input) {
    $missing = validateRequired($input, ['email', 'password', 'full_name', 'phone', 'role']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing));
    }

    $email = sanitize($conn, $input['email']);
    $password = $input['password'];
    $fullName = sanitize($conn, $input['full_name']);
    $phone = sanitize($conn, $input['phone']);
    $role = sanitize($conn, $input['role']);

    if (!in_array($role, ['patient', 'staff'])) {
        sendResponse(false, 'Invalid role specified');
    }

    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendResponse(false, 'Email already registered');
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$email, $passwordHash, $role, $fullName, $phone]);

    $userId = $conn->lastInsertId();

    if ($role === 'patient') {
        $dob = isset($input['date_of_birth']) ? sanitize($conn, $input['date_of_birth']) : null;
        $gender = isset($input['gender']) ? sanitize($conn, $input['gender']) : null;
        $address = isset($input['address']) ? sanitize($conn, $input['address']) : null;
        $bloodGroup = isset($input['blood_group']) ? sanitize($conn, $input['blood_group']) : null;

        $stmt = $conn->prepare("INSERT INTO patients (user_id, date_of_birth, gender, address, blood_group) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $dob, $gender, $address, $bloodGroup]);
    } else {
        $department = isset($input['department']) ? sanitize($conn, $input['department']) : null;
        $specialization = isset($input['specialization']) ? sanitize($conn, $input['specialization']) : null;

        $stmt = $conn->prepare("INSERT INTO staff (user_id, department, specialization) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $department, $specialization]);
    }

    sendResponse(true, 'Registration successful', ['user_id' => $userId]);
}

function handleLogout() {
    session_unset();
    session_destroy();
    sendResponse(true, 'Logged out successfully');
}

function handleCheckSession() {
    if (isset($_SESSION['user_id'])) {
        sendResponse(true, 'Session active', [
            'user_id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'role' => $_SESSION['role'],
            'full_name' => $_SESSION['full_name']
        ]);
    } else {
        sendResponse(false, 'No active session');
    }
}

// ==================== PATIENT HANDLERS ====================

function handleGetPatientDashboard($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.phone FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = ?");
    $stmt->execute([$userId]);
    $patient = $stmt->fetch();

    $stmt = $conn->prepare("SELECT a.*, s.full_name as staff_name FROM appointments a LEFT JOIN staff st ON a.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE a.patient_id = ? AND a.appointment_date >= date('now') AND a.status IN ('pending', 'approved') ORDER BY a.appointment_date ASC LIMIT 5");
    $stmt->execute([$patient['patient_id']]);
    $appointments = $stmt->fetchAll();

    $stmt = $conn->prepare("SELECT * FROM health_records WHERE patient_id = ? ORDER BY record_date DESC LIMIT 1");
    $stmt->execute([$patient['patient_id']]);
    $latestRecord = $stmt->fetch();

    $stmt = $conn->prepare("SELECT * FROM medicines WHERE patient_id = ? AND is_active = 1");
    $stmt->execute([$patient['patient_id']]);
    $medicines = $stmt->fetchAll();

    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$userId]);
    $unreadCount = $stmt->fetch()['count'];

    sendResponse(true, 'Dashboard data retrieved', [
        'patient' => $patient,
        'appointments' => $appointments,
        'latest_record' => $latestRecord,
        'medicines' => $medicines,
        'unread_notifications' => $unreadCount
    ]);
}

function handleGetPatientProfile($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.phone, u.created_at FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.user_id = ?");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();

    sendResponse(true, 'Profile retrieved', $profile);
}

function handleUpdatePatientProfile($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $fullName = sanitize($conn, $input['full_name'] ?? '');
    $phone = sanitize($conn, $input['phone'] ?? '');
    $address = sanitize($conn, $input['address'] ?? '');
    $emergencyContact = sanitize($conn, $input['emergency_contact'] ?? '');
    $emergencyPhone = sanitize($conn, $input['emergency_phone'] ?? '');
    $bloodGroup = sanitize($conn, $input['blood_group'] ?? '');
    $allergies = sanitize($conn, $input['allergies'] ?? '');
    $medicalHistory = sanitize($conn, $input['medical_history'] ?? '');

    $stmt = $conn->prepare("UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?");
    $stmt->execute([$fullName, $phone, $userId]);

    $stmt = $conn->prepare("UPDATE patients SET address = ?, emergency_contact = ?, emergency_phone = ?, blood_group = ?, allergies = ?, medical_history = ? WHERE user_id = ?");
    $stmt->execute([$address, $emergencyContact, $emergencyPhone, $bloodGroup, $allergies, $medicalHistory, $userId]);

    sendResponse(true, 'Profile updated successfully');
}

function handleRequestAppointment($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $missing = validateRequired($input, ['appointment_date', 'appointment_time', 'reason']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing));
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT patient_id FROM patients WHERE user_id = ?");
    $stmt->execute([$userId]);
    $patientId = $stmt->fetch()['patient_id'];

    $appointmentDate = sanitize($conn, $input['appointment_date']);
    $appointmentTime = sanitize($conn, $input['appointment_time']);
    $reason = sanitize($conn, $input['reason']);

    $stmt = $conn->prepare("INSERT INTO appointments (patient_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?)");
    $stmt->execute([$patientId, $appointmentDate, $appointmentTime, $reason]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Appointment requested successfully');
    } else {
        sendResponse(false, 'Failed to request appointment');
    }
}

function handleGetPatientAppointments($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT patient_id FROM patients WHERE user_id = ?");
    $stmt->execute([$userId]);
    $patientId = $stmt->fetch()['patient_id'];

    $stmt = $conn->prepare("SELECT a.*, s.full_name as staff_name, st.department FROM appointments a LEFT JOIN staff st ON a.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC");
    $stmt->execute([$patientId]);
    $appointments = $stmt->fetchAll();

    sendResponse(true, 'Appointments retrieved', $appointments);
}

function handleCancelAppointment($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $appointmentId = intval($input['appointment_id'] ?? 0);
    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT patient_id FROM patients WHERE user_id = ?");
    $stmt->execute([$userId]);
    $patientId = $stmt->fetch()['patient_id'];

    $stmt = $conn->prepare("UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ? AND patient_id = ?");
    $stmt->execute([$appointmentId, $patientId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Appointment cancelled successfully');
    } else {
        sendResponse(false, 'Failed to cancel appointment');
    }
}

function handleGetHealthRecords($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT patient_id FROM patients WHERE user_id = ?");
    $stmt->execute([$userId]);
    $patientId = $stmt->fetch()['patient_id'];

    $stmt = $conn->prepare("SELECT h.*, s.full_name as staff_name FROM health_records h LEFT JOIN staff st ON h.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE h.patient_id = ? ORDER BY h.record_date DESC");
    $stmt->execute([$patientId]);
    $records = $stmt->fetchAll();

    sendResponse(true, 'Health records retrieved', $records);
}

function handleGetMedicines($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'patient') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT patient_id FROM patients WHERE user_id = ?");
    $stmt->execute([$userId]);
    $patientId = $stmt->fetch()['patient_id'];

    $stmt = $conn->prepare("SELECT * FROM medicines WHERE patient_id = ? ORDER BY is_active DESC, created_at DESC");
    $stmt->execute([$patientId]);
    $medicines = $stmt->fetchAll();

    sendResponse(true, 'Medicines retrieved', $medicines);
}

function handleGetWellnessTips($conn) {
    $stmt = $conn->prepare("SELECT * FROM wellness_tips ORDER BY created_at DESC");
    $stmt->execute();
    $tips = $stmt->fetchAll();

    sendResponse(true, 'Wellness tips retrieved', $tips);
}

function handleGetPatientNotifications($conn) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT n.*, s.full_name as sender_name FROM notifications n LEFT JOIN users s ON n.sender_id = s.user_id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 50");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    sendResponse(true, 'Notifications retrieved', $notifications);
}

function handleMarkNotificationRead($conn, $input) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Unauthorized access');
    }

    $notificationId = intval($input['notification_id'] ?? 0);
    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?");
    $stmt->execute([$notificationId, $userId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Notification marked as read');
    } else {
        sendResponse(false, 'Failed to update notification');
    }
}

function handleMarkAllNotificationsRead($conn) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'All notifications marked as read');
    } else {
        sendResponse(false, 'Failed to update notifications');
    }
}

function handleGetUnreadCount($conn) {
    if (!isLoggedIn()) {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$userId]);
    $count = $stmt->fetch()['count'];

    sendResponse(true, 'Unread count retrieved', ['count' => $count]);
}

// ==================== STAFF HANDLERS ====================

function handleGetStaffDashboard($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT s.*, u.full_name, u.email, u.phone FROM staff s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?");
    $stmt->execute([$userId]);
    $staff = $stmt->fetch();

    $stats = [];

    $result = $conn->query("SELECT COUNT(*) as count FROM patients")->fetch();
    $stats['total_patients'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = date('now')")->fetch();
    $stats['today_appointments'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'")->fetch();
    $stats['pending_appointments'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM appointments WHERE strftime('%Y-%m', appointment_date) = strftime('%Y-%m', 'now')")->fetch();
    $stats['month_appointments'] = $result['count'];

    $stmt = $conn->prepare("SELECT a.*, p.full_name as patient_name, u.phone as patient_phone FROM appointments a JOIN patients pt ON a.patient_id = pt.patient_id JOIN users p ON pt.user_id = p.user_id JOIN users u ON pt.user_id = u.user_id ORDER BY a.created_at DESC LIMIT 10");
    $stmt->execute();
    $recentAppointments = $stmt->fetchAll();

    sendResponse(true, 'Staff dashboard data retrieved', [
        'staff' => $staff,
        'stats' => $stats,
        'recent_appointments' => $recentAppointments
    ]);
}

function handleGetAllPatients($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.phone, u.created_at FROM patients p JOIN users u ON p.user_id = u.user_id ORDER BY u.created_at DESC");
    $stmt->execute();
    $patients = $stmt->fetchAll();

    sendResponse(true, 'Patients retrieved', $patients);
}

function handleSearchPatients($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $search = sanitize($conn, $input['query'] ?? '');

    $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.phone FROM patients p JOIN users u ON p.user_id = u.user_id WHERE u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? ORDER BY u.full_name ASC");
    $searchTerm = "%$search%";
    $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
    $patients = $stmt->fetchAll();

    sendResponse(true, 'Search results retrieved', $patients);
}

function handleGetPatientDetails($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);

    $stmt = $conn->prepare("SELECT p.*, u.full_name, u.email, u.phone FROM patients p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = ?");
    $stmt->execute([$patientId]);
    $patient = $stmt->fetch();

    if (!$patient) {
        sendResponse(false, 'Patient not found');
    }

    $stmt = $conn->prepare("SELECT a.*, s.full_name as staff_name FROM appointments a LEFT JOIN staff st ON a.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC");
    $stmt->execute([$patientId]);
    $appointments = $stmt->fetchAll();

    $stmt = $conn->prepare("SELECT * FROM health_records WHERE patient_id = ? ORDER BY record_date DESC");
    $stmt->execute([$patientId]);
    $records = $stmt->fetchAll();

    $stmt = $conn->prepare("SELECT * FROM medicines WHERE patient_id = ? ORDER BY is_active DESC");
    $stmt->execute([$patientId]);
    $medicines = $stmt->fetchAll();

    sendResponse(true, 'Patient details retrieved', [
        'patient' => $patient,
        'appointments' => $appointments,
        'health_records' => $records,
        'medicines' => $medicines
    ]);
}

function handleGetAllAppointments($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $status = isset($input['status']) ? sanitize($conn, $input['status']) : '';

    if ($status) {
        $stmt = $conn->prepare("SELECT a.*, p.full_name as patient_name, u.phone as patient_phone, s.full_name as staff_name FROM appointments a JOIN patients pt ON a.patient_id = pt.patient_id JOIN users p ON pt.user_id = p.user_id JOIN users u ON pt.user_id = u.user_id LEFT JOIN staff st ON a.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE a.status = ? ORDER BY a.appointment_date DESC");
        $stmt->execute([$status]);
    } else {
        $stmt = $conn->prepare("SELECT a.*, p.full_name as patient_name, u.phone as patient_phone, s.full_name as staff_name FROM appointments a JOIN patients pt ON a.patient_id = pt.patient_id JOIN users p ON pt.user_id = p.user_id JOIN users u ON pt.user_id = u.user_id LEFT JOIN staff st ON a.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id ORDER BY a.appointment_date DESC");
        $stmt->execute();
    }
    $appointments = $stmt->fetchAll();

    sendResponse(true, 'Appointments retrieved', $appointments);
}

function handleUpdateAppointmentStatus($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $appointmentId = intval($input['appointment_id'] ?? 0);
    $status = sanitize($conn, $input['status'] ?? '');
    $notes = sanitize($conn, $input['notes'] ?? '');

    if (!in_array($status, ['approved', 'rejected', 'completed'])) {
        sendResponse(false, 'Invalid status');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT staff_id FROM staff WHERE user_id = ?");
    $stmt->execute([$userId]);
    $staffId = $stmt->fetch()['staff_id'];

    $stmt = $conn->prepare("UPDATE appointments SET status = ?, notes = ?, staff_id = ? WHERE appointment_id = ?");
    $stmt->execute([$status, $notes, $staffId, $appointmentId]);

    if ($stmt->rowCount() > 0) {
        $stmt = $conn->prepare("SELECT patient_id FROM appointments WHERE appointment_id = ?");
        $stmt->execute([$appointmentId]);
        $patientId = $stmt->fetch()['patient_id'];

        $stmt = $conn->prepare("SELECT user_id FROM patients WHERE patient_id = ?");
        $stmt->execute([$patientId]);
        $patientUserId = $stmt->fetch()['user_id'];

        $statusMsg = $status === 'approved' ? 'approved' : ($status === 'rejected' ? 'rejected' : 'completed');
        $title = "Appointment " . ucfirst($statusMsg);
        $message = "Your appointment has been $statusMsg by the hospital.";

        $stmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, title, message, type) VALUES (?, ?, ?, ?, 'appointment_reminder')");
        $stmt->execute([$patientUserId, $userId, $title, $message]);

        sendResponse(true, "Appointment $statusMsg successfully");
    } else {
        sendResponse(false, 'Failed to update appointment');
    }
}

function handleRescheduleAppointment($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $appointmentId = intval($input['appointment_id'] ?? 0);
    $newDate = sanitize($conn, $input['new_date'] ?? '');
    $newTime = sanitize($conn, $input['new_time'] ?? '');

    $stmt = $conn->prepare("UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'rescheduled' WHERE appointment_id = ?");
    $stmt->execute([$newDate, $newTime, $appointmentId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Appointment rescheduled successfully');
    } else {
        sendResponse(false, 'Failed to reschedule appointment');
    }
}

function handleAddHealthRecord($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);
    $recordDate = sanitize($conn, $input['record_date'] ?? date('Y-m-d'));
    $recordType = sanitize($conn, $input['record_type'] ?? 'checkup');
    $weight = floatval($input['weight_kg'] ?? 0);
    $height = floatval($input['height_cm'] ?? 0);
    $bp = sanitize($conn, $input['blood_pressure'] ?? '');
    $heartRate = intval($input['heart_rate'] ?? 0);
    $temp = floatval($input['temperature'] ?? 0);
    $sugar = floatval($input['blood_sugar'] ?? 0);
    $cholesterol = floatval($input['cholesterol'] ?? 0);
    $diagnosis = sanitize($conn, $input['diagnosis'] ?? '');
    $treatment = sanitize($conn, $input['treatment'] ?? '');
    $notes = sanitize($conn, $input['notes'] ?? '');

    $bmi = 0;
    if ($height > 0 && $weight > 0) {
        $heightM = $height / 100;
        $bmi = round($weight / ($heightM * $heightM), 2);
    }

    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT staff_id FROM staff WHERE user_id = ?");
    $stmt->execute([$userId]);
    $staffId = $stmt->fetch()['staff_id'];

    $stmt = $conn->prepare("INSERT INTO health_records (patient_id, staff_id, record_date, record_type, weight_kg, height_cm, bmi, blood_pressure, heart_rate, temperature, blood_sugar, cholesterol, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patientId, $staffId, $recordDate, $recordType, $weight, $height, $bmi, $bp, $heartRate, $temp, $sugar, $cholesterol, $diagnosis, $treatment, $notes]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Health record added successfully');
    } else {
        sendResponse(false, 'Failed to add health record');
    }
}

function handleUpdateHealthRecord($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $recordId = intval($input['record_id'] ?? 0);
    $weight = floatval($input['weight_kg'] ?? 0);
    $height = floatval($input['height_cm'] ?? 0);
    $bp = sanitize($conn, $input['blood_pressure'] ?? '');
    $heartRate = intval($input['heart_rate'] ?? 0);
    $temp = floatval($input['temperature'] ?? 0);
    $sugar = floatval($input['blood_sugar'] ?? 0);
    $cholesterol = floatval($input['cholesterol'] ?? 0);
    $diagnosis = sanitize($conn, $input['diagnosis'] ?? '');
    $treatment = sanitize($conn, $input['treatment'] ?? '');
    $notes = sanitize($conn, $input['notes'] ?? '');

    $bmi = 0;
    if ($height > 0 && $weight > 0) {
        $heightM = $height / 100;
        $bmi = round($weight / ($heightM * $heightM), 2);
    }

    $stmt = $conn->prepare("UPDATE health_records SET weight_kg = ?, height_cm = ?, bmi = ?, blood_pressure = ?, heart_rate = ?, temperature = ?, blood_sugar = ?, cholesterol = ?, diagnosis = ?, treatment = ?, notes = ? WHERE record_id = ?");
    $stmt->execute([$weight, $height, $bmi, $bp, $heartRate, $temp, $sugar, $cholesterol, $diagnosis, $treatment, $notes, $recordId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Health record updated successfully');
    } else {
        sendResponse(false, 'Failed to update health record');
    }
}

function handleGetPatientHealthRecords($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);

    $stmt = $conn->prepare("SELECT h.*, s.full_name as staff_name FROM health_records h LEFT JOIN staff st ON h.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id WHERE h.patient_id = ? ORDER BY h.record_date DESC");
    $stmt->execute([$patientId]);
    $records = $stmt->fetchAll();

    sendResponse(true, 'Health records retrieved', $records);
}

function handleAddMedicine($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);
    $medicineName = sanitize($conn, $input['medicine_name'] ?? '');
    $dosage = sanitize($conn, $input['dosage'] ?? '');
    $frequency = sanitize($conn, $input['frequency'] ?? '');
    $startDate = sanitize($conn, $input['start_date'] ?? '');
    $endDate = sanitize($conn, $input['end_date'] ?? '');
    $instructions = sanitize($conn, $input['instructions'] ?? '');

    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT staff_id FROM staff WHERE user_id = ?");
    $stmt->execute([$userId]);
    $staffId = $stmt->fetch()['staff_id'];

    $stmt = $conn->prepare("INSERT INTO medicines (patient_id, staff_id, medicine_name, dosage, frequency, start_date, end_date, instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patientId, $staffId, $medicineName, $dosage, $frequency, $startDate, $endDate, $instructions]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Medicine added successfully');
    } else {
        sendResponse(false, 'Failed to add medicine');
    }
}

function handleUpdateMedicine($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $medicineId = intval($input['medicine_id'] ?? 0);
    $isActive = intval($input['is_active'] ?? 1);

    $stmt = $conn->prepare("UPDATE medicines SET is_active = ? WHERE medicine_id = ?");
    $stmt->execute([$isActive, $medicineId]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Medicine updated successfully');
    } else {
        sendResponse(false, 'Failed to update medicine');
    }
}

function handleGetPatientMedicines($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);

    $stmt = $conn->prepare("SELECT * FROM medicines WHERE patient_id = ? ORDER BY is_active DESC, created_at DESC");
    $stmt->execute([$patientId]);
    $medicines = $stmt->fetchAll();

    sendResponse(true, 'Medicines retrieved', $medicines);
}

function handleSendNotification($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);
    $title = sanitize($conn, $input['title'] ?? '');
    $message = sanitize($conn, $input['message'] ?? '');
    $type = sanitize($conn, $input['type'] ?? 'general');

    $stmt = $conn->prepare("SELECT user_id FROM patients WHERE patient_id = ?");
    $stmt->execute([$patientId]);
    $result = $stmt->fetch();

    if (!$result) {
        sendResponse(false, 'Patient not found');
    }

    $patientUserId = $result['user_id'];
    $senderId = $_SESSION['user_id'];

    $stmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, title, message, type) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$patientUserId, $senderId, $title, $message, $type]);

    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Notification sent successfully');
    } else {
        sendResponse(false, 'Failed to send notification');
    }
}

function handleGetStaffNotifications($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $userId = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT n.*, u.full_name as recipient_name FROM notifications n JOIN users u ON n.user_id = u.user_id WHERE n.sender_id = ? ORDER BY n.created_at DESC LIMIT 50");
    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    sendResponse(true, 'Notifications retrieved', $notifications);
}

function handleGetReports($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $stmt = $conn->prepare("SELECT r.*, p.full_name as patient_name, s.full_name as staff_name FROM reports r JOIN patients pt ON r.patient_id = pt.patient_id JOIN users p ON pt.user_id = p.user_id LEFT JOIN staff st ON r.staff_id = st.staff_id LEFT JOIN users s ON st.user_id = s.user_id ORDER BY r.created_at DESC");
    $stmt->execute();
    $reports = $stmt->fetchAll();

    sendResponse(true, 'Reports retrieved', $reports);
}

function handleAddReport($conn, $input) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $patientId = intval($input['patient_id'] ?? 0);
    $reportType = sanitize($conn, $input['report_type'] ?? 'monthly_summary');
    $reportDate = sanitize($conn, $input['report_date'] ?? date('Y-m-d'));
    $content = sanitize($conn, $input['content'] ?? '');

    $userId = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT staff_id FROM staff WHERE user_id = ?");
    $stmt->execute([$userId]);
    $staffId = $stmt->fetch()['staff_id'];

    $stmt = $conn->prepare("INSERT INTO reports (patient_id, staff_id, report_type, report_date, content) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$patientId, $staffId, $reportType, $reportDate, $content]);

    if ($stmt->rowCount() > 0) {
        $stmt = $conn->prepare("SELECT user_id FROM patients WHERE patient_id = ?");
        $stmt->execute([$patientId]);
        $patientUserId = $stmt->fetch()['user_id'];

        $title = "New Report Available";
        $message = "A new $reportType has been generated for you. Please check your reports section.";

        $stmt = $conn->prepare("INSERT INTO notifications (user_id, sender_id, title, message, type) VALUES (?, ?, ?, ?, 'report')");
        $stmt->execute([$patientUserId, $userId, $title, $message]);

        sendResponse(true, 'Report added successfully');
    } else {
        sendResponse(false, 'Failed to add report');
    }
}

function handleGetAnalytics($conn) {
    if (!isLoggedIn() || $_SESSION['role'] !== 'staff') {
        sendResponse(false, 'Unauthorized access');
    }

    $analytics = [];

    $result = $conn->query("SELECT status, COUNT(*) as count FROM appointments GROUP BY status")->fetchAll();
    $analytics['appointments_by_status'] = $result;

    $result = $conn->query("SELECT gender, COUNT(*) as count FROM patients GROUP BY gender")->fetchAll();
    $analytics['patients_by_gender'] = $result;

    $result = $conn->query("SELECT strftime('%Y-%m', appointment_date) as month, COUNT(*) as count FROM appointments WHERE appointment_date >= date('now', '-6 months') GROUP BY strftime('%Y-%m', appointment_date) ORDER BY month ASC")->fetchAll();
    $analytics['appointments_by_month'] = $result;

    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'patient'")->fetch();
    $analytics['total_patients'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'staff'")->fetch();
    $analytics['total_staff'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM health_records")->fetch();
    $analytics['total_records'] = $result['count'];

    $result = $conn->query("SELECT COUNT(*) as count FROM medicines WHERE is_active = 1")->fetch();
    $analytics['active_medicines'] = $result['count'];

    sendResponse(true, 'Analytics retrieved', $analytics);
}

// ==================== HELPER FUNCTIONS ====================

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}
