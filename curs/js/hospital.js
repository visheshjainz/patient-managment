/**
 * Patient Wellness System - Hospital JavaScript
 * Hospital staff-side functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');

    if (page === 'dashboard') initStaffDashboard();
    if (page === 'patients') initPatients();
    if (page === 'appointments') initStaffAppointments();
    if (page === 'records') initStaffRecords();
    if (page === 'notifications') initStaffNotifications();
    if (page === 'reports') initReports();
});

// ==================== STAFF DASHBOARD ====================
async function initStaffDashboard() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('dashboard');
    initStaffSidebar('dashboard');

    const result = await apiRequest('get_staff_dashboard');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const data = result.data;
    const container = document.getElementById('staff-dashboard-content');
    if (!container) return;

    container.innerHTML = `
        <div class="hospital-header">
            <h2>Welcome, ${data.staff.full_name}!</h2>
            <p>${data.staff.department} - ${data.staff.specialization}</p>
        </div>

        <div class="stats-row">
            <div class="stat-box">
                <div class="stat-icon blue">👥</div>
                <div class="stat-info">
                    <div class="stat-number">${data.stats.total_patients}</div>
                    <div class="stat-text">Total Patients</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon green">📅</div>
                <div class="stat-info">
                    <div class="stat-number">${data.stats.today_appointments}</div>
                    <div class="stat-text">Today's Appointments</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon yellow">⏳</div>
                <div class="stat-info">
                    <div class="stat-number">${data.stats.pending_appointments}</div>
                    <div class="stat-text">Pending Appointments</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-icon purple">📊</div>
                <div class="stat-info">
                    <div class="stat-number">${data.stats.month_appointments}</div>
                    <div class="stat-text">This Month</div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Appointments</h3>
                <a href="appointments.html" class="btn btn-sm btn-outline">View All</a>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recent_appointments.length > 0 ? data.recent_appointments.map(apt => `
                            <tr>
                                <td>${apt.patient_name}</td>
                                <td>${formatDate(apt.appointment_date)}</td>
                                <td>${formatTime(apt.appointment_time)}</td>
                                <td>${apt.reason}</td>
                                <td>${getStatusBadge(apt.status)}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="5" class="text-center">No appointments found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==================== PATIENTS ====================
async function initPatients() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('patients');
    initStaffSidebar('patients');

    const container = document.getElementById('patients-content');
    if (!container) return;

    const result = await apiRequest('get_all_patients');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const patients = result.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Patient Management</h1>
        </div>

        <div class="search-bar">
            <input type="text" id="search-input" placeholder="Search patients by name, email, or phone..." oninput="searchPatients(this.value)">
        </div>

        <div class="card" id="patients-list">
            ${patients.length > 0 ? patients.map(p => `
                <div class="patient-card">
                    <div class="patient-avatar">${p.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    <div class="patient-info">
                        <h4>${p.full_name}</h4>
                        <p>${p.email} | ${p.phone || 'No phone'}</p>
                        <p>Blood: ${p.blood_group || 'N/A'} | Gender: ${p.gender || 'N/A'}</p>
                    </div>
                    <div class="patient-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewPatientDetails(${p.patient_id})">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="sendNotificationToPatient(${p.patient_id})">Notify</button>
                    </div>
                </div>
            `).join('') : '<div class="empty-state"><p>No patients found.</p></div>'}
        </div>
    `;
}

// Search patients
async function searchPatients(query) {
    if (!query || query.length < 2) {
        initPatients();
        return;
    }

    const result = await apiRequest('search_patients', { query });
    if (!result.success) return;

    const patients = result.data;
    const container = document.getElementById('patients-list');
    if (!container) return;

    container.innerHTML = patients.length > 0 ? patients.map(p => `
        <div class="patient-card">
            <div class="patient-avatar">${p.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div class="patient-info">
                <h4>${p.full_name}</h4>
                <p>${p.email} | ${p.phone || 'No phone'}</p>
                <p>Blood: ${p.blood_group || 'N/A'} | Gender: ${p.gender || 'N/A'}</p>
            </div>
            <div class="patient-actions">
                <button class="btn btn-sm btn-primary" onclick="viewPatientDetails(${p.patient_id})">View</button>
                <button class="btn btn-sm btn-secondary" onclick="sendNotificationToPatient(${p.patient_id})">Notify</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state"><p>No patients found.</p></div>';
}

// View patient details
async function viewPatientDetails(patientId) {
    const result = await apiRequest('get_patient_details', { patient_id: patientId });
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const data = result.data;
    const patient = data.patient;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>Patient Details - ${patient.full_name}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="profile-details">
                <div class="detail-item"><div class="label">Email</div><div class="value">${patient.email}</div></div>
                <div class="detail-item"><div class="label">Phone</div><div class="value">${patient.phone || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Blood Group</div><div class="value">${patient.blood_group || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Gender</div><div class="value">${patient.gender || 'N/A'}</div></div>
                <div class="detail-item"><div class="label">Date of Birth</div><div class="value">${formatDate(patient.date_of_birth)}</div></div>
                <div class="detail-item"><div class="label">Emergency Contact</div><div class="value">${patient.emergency_contact || 'N/A'}</div></div>
            </div>
            <div class="mt-3">
                <h4>Allergies</h4>
                <p>${patient.allergies || 'None reported'}</p>
            </div>
            <div class="mt-2">
                <h4>Medical History</h4>
                <p>${patient.medical_history || 'No significant history'}</p>
            </div>
            <div class="mt-3">
                <h4>Recent Appointments</h4>
                ${data.appointments.length > 0 ? data.appointments.slice(0, 3).map(apt => `
                    <p>${formatDate(apt.appointment_date)} - ${apt.reason} (${apt.status})</p>
                `).join('') : '<p>No appointments</p>'}
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); showAddRecordModal(${patient.patient_id})">Add Health Record</button>
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); showAddMedicineModal(${patient.patient_id})">Add Medicine</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==================== APPOINTMENTS ====================
async function initStaffAppointments() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('appointments');
    initStaffSidebar('appointments');

    const container = document.getElementById('staff-appointments-content');
    if (!container) return;

    const result = await apiRequest('get_all_appointments');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const appointments = result.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Appointments Management</h1>
        </div>

        <div class="filter-tabs">
            <div class="filter-tab active" onclick="filterAppointments('all', this)">All</div>
            <div class="filter-tab" onclick="filterAppointments('pending', this)">Pending</div>
            <div class="filter-tab" onclick="filterAppointments('approved', this)">Approved</div>
            <div class="filter-tab" onclick="filterAppointments('completed', this)">Completed</div>
            <div class="filter-tab" onclick="filterAppointments('rejected', this)">Rejected</div>
        </div>

        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointments.length > 0 ? appointments.map(apt => `
                            <tr>
                                <td>${apt.patient_name}</td>
                                <td>${formatDate(apt.appointment_date)}</td>
                                <td>${formatTime(apt.appointment_time)}</td>
                                <td>${apt.reason}</td>
                                <td>${getStatusBadge(apt.status)}</td>
                                <td>
                                    <div class="appointment-actions">
                                        ${apt.status === 'pending' ? `
                                            <button class="action-btn approve" onclick="updateAppointmentStatus(${apt.appointment_id}, 'approved')">Approve</button>
                                            <button class="action-btn reject" onclick="updateAppointmentStatus(${apt.appointment_id}, 'rejected')">Reject</button>
                                            <button class="action-btn reschedule" onclick="showRescheduleModal(${apt.appointment_id})">Reschedule</button>
                                        ` : ''}
                                        ${apt.status === 'approved' ? `
                                            <button class="action-btn complete" onclick="updateAppointmentStatus(${apt.appointment_id}, 'completed')">Complete</button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="6" class="text-center">No appointments found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Filter appointments
async function filterAppointments(status, element) {
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    const result = await apiRequest('get_all_appointments', { status: status === 'all' ? '' : status });
    if (!result.success) return;

    const appointments = result.data;
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = appointments.length > 0 ? appointments.map(apt => `
        <tr>
            <td>${apt.patient_name}</td>
            <td>${formatDate(apt.appointment_date)}</td>
            <td>${formatTime(apt.appointment_time)}</td>
            <td>${apt.reason}</td>
            <td>${getStatusBadge(apt.status)}</td>
            <td>
                <div class="appointment-actions">
                    ${apt.status === 'pending' ? `
                        <button class="action-btn approve" onclick="updateAppointmentStatus(${apt.appointment_id}, 'approved')">Approve</button>
                        <button class="action-btn reject" onclick="updateAppointmentStatus(${apt.appointment_id}, 'rejected')">Reject</button>
                        <button class="action-btn reschedule" onclick="showRescheduleModal(${apt.appointment_id})">Reschedule</button>
                    ` : ''}
                    ${apt.status === 'approved' ? `
                        <button class="action-btn complete" onclick="updateAppointmentStatus(${apt.appointment_id}, 'completed')">Complete</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" class="text-center">No appointments found.</td></tr>';
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
    const result = await apiRequest('update_appointment_status', {
        appointment_id: appointmentId,
        status: status
    });
    showAlert(result.message, result.success ? 'success' : 'danger');
    if (result.success) initStaffAppointments();
}

// Show reschedule modal
function showRescheduleModal(appointmentId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Reschedule Appointment</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form id="reschedule-form">
                <div class="form-group">
                    <label class="form-label">New Date</label>
                    <input type="date" name="new_date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">New Time</label>
                    <input type="time" name="new_time" class="form-input" required>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Reschedule</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('reschedule-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.appointment_id = appointmentId;
        const result = await apiRequest('reschedule_appointment', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            modal.remove();
            initStaffAppointments();
        }
    });
}

// ==================== RECORDS ====================
async function initStaffRecords() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('records');
    initStaffSidebar('records');

    const container = document.getElementById('staff-records-content');
    if (!container) return;

    // Show patient selector first
    const patientsResult = await apiRequest('get_all_patients');
    if (!patientsResult.success) {
        showAlert(patientsResult.message, 'danger');
        return;
    }

    const patients = patientsResult.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Health Records Management</h1>
        </div>

        <div class="card">
            <div class="form-group">
                <label class="form-label">Select Patient</label>
                <select id="patient-select" class="form-select" onchange="loadPatientRecords(this.value)">
                    <option value="">-- Select a patient --</option>
                    ${patients.map(p => `<option value="${p.patient_id}">${p.full_name} (${p.email})</option>`).join('')}
                </select>
            </div>
        </div>

        <div id="records-list"></div>
    `;
}

// Load patient records
async function loadPatientRecords(patientId) {
    if (!patientId) return;

    const result = await apiRequest('get_patient_health_records', { patient_id: patientId });
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const records = result.data;
    const container = document.getElementById('records-list');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Health Records</h3>
                <button class="btn btn-primary btn-sm" onclick="showAddRecordModal(${patientId})">+ Add Record</button>
            </div>
            ${records.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Weight</th>
                                <th>BMI</th>
                                <th>BP</th>
                                <th>Heart Rate</th>
                                <th>Diagnosis</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(r => `
                                <tr>
                                    <td>${formatDate(r.record_date)}</td>
                                    <td>${r.record_type}</td>
                                    <td>${r.weight_kg || '--'} kg</td>
                                    <td>${r.bmi || '--'}</td>
                                    <td>${r.blood_pressure || '--'}</td>
                                    <td>${r.heart_rate || '--'} bpm</td>
                                    <td>${r.diagnosis || '--'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="empty-state"><p>No health records found for this patient.</p></div>'}
        </div>
    `;
}

// Show add record modal
function showAddRecordModal(patientId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Add Health Record</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form id="add-record-form">
                <input type="hidden" name="patient_id" value="${patientId}">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date</label>
                        <input type="date" name="record_date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select name="record_type" class="form-select">
                            <option value="checkup">Checkup</option>
                            <option value="lab_result">Lab Result</option>
                            <option value="diagnosis">Diagnosis</option>
                            <option value="prescription">Prescription</option>
                            <option value="vaccination">Vaccination</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Weight (kg)</label>
                        <input type="number" name="weight_kg" class="form-input" step="0.1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Height (cm)</label>
                        <input type="number" name="height_cm" class="form-input" step="0.1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Blood Pressure</label>
                        <input type="text" name="blood_pressure" class="form-input" placeholder="120/80">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Heart Rate (bpm)</label>
                        <input type="number" name="heart_rate" class="form-input">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Temperature (°F)</label>
                        <input type="number" name="temperature" class="form-input" step="0.1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Blood Sugar</label>
                        <input type="number" name="blood_sugar" class="form-input" step="0.01">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Cholesterol</label>
                    <input type="number" name="cholesterol" class="form-input" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">Diagnosis</label>
                    <textarea name="diagnosis" class="form-textarea"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Treatment</label>
                    <textarea name="treatment" class="form-textarea"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea name="notes" class="form-textarea"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Add Record</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('add-record-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('add_health_record', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            modal.remove();
            loadPatientRecords(patientId);
        }
    });
}

// Show add medicine modal
function showAddMedicineModal(patientId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Add Medicine</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form id="add-medicine-form">
                <input type="hidden" name="patient_id" value="${patientId}">
                <div class="form-group">
                    <label class="form-label">Medicine Name</label>
                    <input type="text" name="medicine_name" class="form-input" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Dosage</label>
                        <input type="text" name="dosage" class="form-input" placeholder="e.g., 500mg">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Frequency</label>
                        <input type="text" name="frequency" class="form-input" placeholder="e.g., Twice daily">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="date" name="start_date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="date" name="end_date" class="form-input">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Instructions</label>
                    <textarea name="instructions" class="form-textarea" placeholder="e.g., Take after meals"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Add Medicine</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('add-medicine-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('add_medicine', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) modal.remove();
    });
}

// ==================== NOTIFICATIONS ====================
async function initStaffNotifications() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('notifications');
    initStaffSidebar('notifications');

    const container = document.getElementById('staff-notifications-content');
    if (!container) return;

    const result = await apiRequest('get_staff_notifications');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const notifications = result.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Notifications</h1>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Send Notification to Patient</h3>
                </div>
                <form id="send-notification-form">
                    <div class="form-group">
                        <label class="form-label">Select Patient</label>
                        <select name="patient_id" class="form-select" id="notify-patient-select" required>
                            <option value="">-- Select patient --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notification Type</label>
                        <div class="type-selector">
                            <div class="type-option selected" onclick="selectNotificationType('appointment_reminder', this)">
                                <div class="type-icon">📅</div>
                                <div class="type-label">Appointment</div>
                            </div>
                            <div class="type-option" onclick="selectNotificationType('checkup_reminder', this)">
                                <div class="type-icon">🏥</div>
                                <div class="type-label">Checkup</div>
                            </div>
                            <div class="type-option" onclick="selectNotificationType('medicine_reminder', this)">
                                <div class="type-icon">💊</div>
                                <div class="type-label">Medicine</div>
                            </div>
                            <div class="type-option" onclick="selectNotificationType('report', this)">
                                <div class="type-icon">📋</div>
                                <div class="type-label">Report</div>
                            </div>
                            <div class="type-option" onclick="selectNotificationType('hospital_message', this)">
                                <div class="type-icon">📢</div>
                                <div class="type-label">Message</div>
                            </div>
                        </div>
                        <input type="hidden" name="type" id="notification-type" value="appointment_reminder">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Title</label>
                        <input type="text" name="title" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message</label>
                        <textarea name="message" class="form-textarea" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Send Notification</button>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Sent Notifications</h3>
                </div>
                ${notifications.length > 0 ? notifications.map(notif => `
                    <div class="notification-item">
                        <div class="notification-content">
                            <div class="notification-title">${notif.title}</div>
                            <div class="notification-message">${notif.message}</div>
                            <div class="notification-time">To: ${notif.recipient_name} | ${formatDateTime(notif.created_at)}</div>
                        </div>
                        <span class="badge ${getNotificationTypeClass(notif.type)}">${getNotificationTypeLabel(notif.type)}</span>
                    </div>
                `).join('') : '<div class="empty-state"><p>No notifications sent yet.</p></div>'}
            </div>
        </div>
    `;

    // Load patients into select
    const patientsResult = await apiRequest('get_all_patients');
    if (patientsResult.success) {
        const select = document.getElementById('notify-patient-select');
        patientsResult.data.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.full_name;
            select.appendChild(option);
        });
    }

    document.getElementById('send-notification-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('send_notification', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            e.target.reset();
            initStaffNotifications();
        }
    });
}

// Select notification type
function selectNotificationType(type, element) {
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('notification-type').value = type;
}

// Send notification to specific patient
function sendNotificationToPatient(patientId) {
    window.location.href = `notifications.html?patient_id=${patientId}`;
}

// ==================== REPORTS ====================
async function initReports() {
    const user = await checkAuth('staff');
    if (!user) return;

    initStaffNavbar('reports');
    initStaffSidebar('reports');

    const container = document.getElementById('reports-content');
    if (!container) return;

    const result = await apiRequest('get_reports');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const reports = result.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Reports & Analytics</h1>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Add New Report</h3>
            </div>
            <form id="add-report-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Patient</label>
                        <select name="patient_id" class="form-select" id="report-patient-select" required>
                            <option value="">-- Select patient --</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Report Type</label>
                        <select name="report_type" class="form-select">
                            <option value="monthly_summary">Monthly Summary</option>
                            <option value="lab_report">Lab Report</option>
                            <option value="progress_report">Progress Report</option>
                            <option value="discharge_summary">Discharge Summary</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Report Date</label>
                    <input type="date" name="report_date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">Report Content</label>
                    <textarea name="content" class="form-textarea" required placeholder="Enter report details..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Add Report</button>
            </form>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">All Reports</h3>
            </div>
            ${reports.length > 0 ? reports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <div>
                            <div class="report-title">${report.report_type.replace('_', ' ').toUpperCase()}</div>
                            <div class="report-date">${formatDate(report.report_date)} | Patient: ${report.patient_name} | By: ${report.staff_name || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="report-content">${report.content}</div>
                </div>
            `).join('') : '<div class="empty-state"><p>No reports found.</p></div>'}
        </div>
    `;

    // Load patients into select
    const patientsResult = await apiRequest('get_all_patients');
    if (patientsResult.success) {
        const select = document.getElementById('report-patient-select');
        patientsResult.data.forEach(p => {
            const option = document.createElement('option');
            option.value = p.patient_id;
            option.textContent = p.full_name;
            select.appendChild(option);
        });
    }

    document.getElementById('add-report-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('add_report', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            e.target.reset();
            initReports();
        }
    });
}

// ==================== STAFF NAVBAR & SIDEBAR ====================
function initStaffNavbar(activePage = '') {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
        <div class="container">
            <a href="dashboard.html" class="navbar-brand">
                <span>🏥</span>
                <span>Hospital Portal</span>
            </a>
            <button class="menu-toggle" onclick="toggleMobileMenu()">☰</button>
            <ul class="navbar-nav" id="navbarNav">
                <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="patients.html" class="${activePage === 'patients' ? 'active' : ''}">Patients</a></li>
                <li><a href="appointments.html" class="${activePage === 'appointments' ? 'active' : ''}">Appointments</a></li>
                <li><a href="records.html" class="${activePage === 'records' ? 'active' : ''}">Records</a></li>
                <li><a href="notifications.html" class="${activePage === 'notifications' ? 'active' : ''}">Notifications</a></li>
                <li><a href="reports.html" class="${activePage === 'reports' ? 'active' : ''}">Reports</a></li>
                <li><a href="#" onclick="logout(); return false;">Logout</a></li>
            </ul>
        </div>
    `;
    document.body.insertBefore(navbar, document.body.firstChild);
}

function initStaffSidebar(activePage = '') {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    sidebar.innerHTML = `
        <ul class="sidebar-nav">
            <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">📊 Dashboard</a></li>
            <li><a href="patients.html" class="${activePage === 'patients' ? 'active' : ''}">👥 Patients</a></li>
            <li><a href="appointments.html" class="${activePage === 'appointments' ? 'active' : ''}">📅 Appointments</a></li>
            <li><a href="records.html" class="${activePage === 'records' ? 'active' : ''}">📋 Health Records</a></li>
            <li><a href="notifications.html" class="${activePage === 'notifications' ? 'active' : ''}">🔔 Notifications</a></li>
            <li><a href="reports.html" class="${activePage === 'reports' ? 'active' : ''}">📈 Reports</a></li>
            <li><a href="#" onclick="logout(); return false;">🚪 Logout</a></li>
        </ul>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
}
