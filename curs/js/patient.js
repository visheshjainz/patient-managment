/**
 * Patient Wellness System - Patient JavaScript
 * Patient-side functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');

    if (page === 'dashboard') initDashboard();
    if (page === 'profile') initProfile();
    if (page === 'appointments') initAppointments();
    if (page === 'health-records') initHealthRecords();
    if (page === 'medicines') initMedicines();
    if (page === 'notifications') initNotifications();
    if (page === 'wellness') initWellness();
});

// ==================== DASHBOARD ====================
async function initDashboard() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('dashboard');
    initSidebar('dashboard');

    const result = await apiRequest('get_patient_dashboard');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const data = result.data;
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    // Calculate wellness score (simple algorithm)
    const bmi = data.latest_record ? data.latest_record.bmi : 0;
    let wellnessScore = 70;
    if (bmi > 0) {
        if (bmi >= 18.5 && bmi < 25) wellnessScore += 20;
        else if (bmi >= 25 && bmi < 30) wellnessScore += 10;
        else wellnessScore += 5;
    }
    wellnessScore = Math.min(wellnessScore, 100);

    const bmiCategory = bmi > 0 ? getBMICategory(parseFloat(bmi)) : null;

    container.innerHTML = `
        <div class="patient-hero">
            <h2>Welcome back, ${data.patient.full_name}!</h2>
            <p>Here's your health overview for today.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${data.appointments.length}</div>
                <div class="stat-label">Upcoming Appointments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.medicines.length}</div>
                <div class="stat-label">Active Medicines</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.unread_notifications}</div>
                <div class="stat-label">Unread Notifications</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${wellnessScore}%</div>
                <div class="stat-label">Wellness Score</div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Health Metrics</h3>
                </div>
                ${data.latest_record ? `
                    <div class="health-metrics">
                        <div class="metric-card">
                            <div class="metric-icon">⚖️</div>
                            <div class="metric-value">${data.latest_record.weight_kg || '--'} kg</div>
                            <div class="metric-label">Weight</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">📏</div>
                            <div class="metric-value">${data.latest_record.height_cm || '--'} cm</div>
                            <div class="metric-label">Height</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">💪</div>
                            <div class="metric-value">${data.latest_record.bmi || '--'}</div>
                            <div class="metric-label">BMI</div>
                            ${bmiCategory ? `<span class="metric-status bmi-indicator ${bmiCategory.class}" style="padding:2px 8px;border-radius:10px;font-size:0.7rem;">${bmiCategory.label}</span>` : ''}
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🩺</div>
                            <div class="metric-value">${data.latest_record.blood_pressure || '--'}</div>
                            <div class="metric-label">Blood Pressure</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">❤️</div>
                            <div class="metric-value">${data.latest_record.heart_rate || '--'} bpm</div>
                            <div class="metric-label">Heart Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🌡️</div>
                            <div class="metric-value">${data.latest_record.temperature || '--'}°F</div>
                            <div class="metric-label">Temperature</div>
                        </div>
                    </div>
                ` : '<div class="empty-state"><p>No health records yet.</p></div>'}
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Upcoming Appointments</h3>
                    <a href="appointments.html" class="btn btn-sm btn-outline">View All</a>
                </div>
                ${data.appointments.length > 0 ? data.appointments.map(apt => `
                    <div class="appointment-card">
                        <div class="appointment-date">
                            <div class="day">${new Date(apt.appointment_date).getDate()}</div>
                            <div class="month">${new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div class="appointment-info">
                            <h4>${apt.staff_name || 'TBD'}</h4>
                            <p>${formatTime(apt.appointment_time)} - ${apt.reason}</p>
                        </div>
                        ${getStatusBadge(apt.status)}
                    </div>
                `).join('') : '<div class="empty-state"><p>No upcoming appointments.</p></div>'}
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Current Medications</h3>
                <a href="medicines.html" class="btn btn-sm btn-outline">View All</a>
            </div>
            ${data.medicines.length > 0 ? data.medicines.map(med => `
                <div class="medicine-card">
                    <div class="med-icon">💊</div>
                    <div class="med-info">
                        <div class="med-name">${med.medicine_name}</div>
                        <div class="med-dosage">${med.dosage} - ${med.frequency}</div>
                    </div>
                    <div class="med-time">${med.instructions || ''}</div>
                </div>
            `).join('') : '<div class="empty-state"><p>No active medications.</p></div>'}
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
            </div>
            <div class="quick-actions">
                <div class="quick-action-btn" onclick="location.href='appointments.html'">
                    <span class="icon">📅</span>
                    <span class="label">Book Appointment</span>
                </div>
                <div class="quick-action-btn" onclick="location.href='health-records.html'">
                    <span class="icon">📋</span>
                    <span class="label">View Records</span>
                </div>
                <div class="quick-action-btn" onclick="location.href='wellness.html'">
                    <span class="icon">🌿</span>
                    <span class="label">Wellness Tips</span>
                </div>
                <div class="quick-action-btn" onclick="location.href='profile.html'">
                    <span class="icon">👤</span>
                    <span class="label">Update Profile</span>
                </div>
            </div>
        </div>
    `;
}

// ==================== PROFILE ====================
async function initProfile() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('profile');
    initSidebar('profile');

    const result = await apiRequest('get_patient_profile');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const profile = result.data;
    const container = document.getElementById('profile-content');
    if (!container) return;

    const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">My Profile</h1>
        </div>

        <div class="card">
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-info">
                    <h3>${profile.full_name}</h3>
                    <p>${profile.email} | ${profile.phone || 'No phone'}</p>
                    <p class="text-muted">Member since ${formatDate(profile.created_at)}</p>
                </div>
            </div>

            <form id="profile-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" name="full_name" class="form-input" value="${profile.full_name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" name="phone" class="form-input" value="${profile.phone || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <textarea name="address" class="form-textarea">${profile.address || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Emergency Contact</label>
                        <input type="text" name="emergency_contact" class="form-input" value="${profile.emergency_contact || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Emergency Phone</label>
                        <input type="tel" name="emergency_phone" class="form-input" value="${profile.emergency_phone || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Blood Group</label>
                        <select name="blood_group" class="form-select">
                            <option value="">Select</option>
                            ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg =>
                                `<option value="${bg}" ${profile.blood_group === bg ? 'selected' : ''}>${bg}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" name="date_of_birth" class="form-input" value="${profile.date_of_birth || ''}" disabled>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Allergies</label>
                    <textarea name="allergies" class="form-textarea">${profile.allergies || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Medical History</label>
                    <textarea name="medical_history" class="form-textarea">${profile.medical_history || ''}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Profile</button>
            </form>
        </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('update_patient_profile', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
    });
}

// ==================== APPOINTMENTS ====================
async function initAppointments() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('appointments');
    initSidebar('appointments');

    const container = document.getElementById('appointments-content');
    if (!container) return;

    // Load appointments
    const result = await apiRequest('get_patient_appointments');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const appointments = result.data;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">My Appointments</h1>
            <button class="btn btn-primary" onclick="showBookAppointmentModal()">+ Book Appointment</button>
        </div>

        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Doctor</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointments.length > 0 ? appointments.map(apt => `
                            <tr>
                                <td>${formatDate(apt.appointment_date)}</td>
                                <td>${formatTime(apt.appointment_time)}</td>
                                <td>${apt.staff_name || 'TBD'}</td>
                                <td>${apt.reason}</td>
                                <td>${getStatusBadge(apt.status)}</td>
                                <td>
                                    ${apt.status === 'pending' ? `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${apt.appointment_id})">Cancel</button>` : '-'}
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="6" class="text-center">No appointments found.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Show book appointment modal
function showBookAppointmentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Book Appointment</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form id="book-appointment-form">
                <div class="form-group">
                    <label class="form-label">Date</label>
                    <input type="date" name="appointment_date" class="form-input" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">Time</label>
                    <input type="time" name="appointment_time" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Reason</label>
                    <textarea name="reason" class="form-textarea" required placeholder="Describe your symptoms or reason for visit"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Request Appointment</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('book-appointment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const result = await apiRequest('request_appointment', data);
        showAlert(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            modal.remove();
            initAppointments();
        }
    });
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    const result = await apiRequest('cancel_appointment', { appointment_id: appointmentId });
    showAlert(result.message, result.success ? 'success' : 'danger');
    if (result.success) initAppointments();
}

// ==================== HEALTH RECORDS ====================
async function initHealthRecords() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('records');
    initSidebar('records');

    const result = await apiRequest('get_health_records');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const records = result.data;
    const container = document.getElementById('records-content');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Health Records</h1>
        </div>

        <div class="card">
            ${records.length > 0 ? `
                <div class="record-timeline">
                    ${records.map(record => `
                        <div class="timeline-item">
                            <div class="timeline-date">${formatDate(record.record_date)} - ${record.record_type}</div>
                            <div class="timeline-content">
                                <h4>${record.diagnosis || 'General Checkup'}</h4>
                                <div class="vital-signs">
                                    <div class="vital">
                                        <div class="vital-value">${record.weight_kg || '--'} kg</div>
                                        <div class="vital-label">Weight</div>
                                    </div>
                                    <div class="vital">
                                        <div class="vital-value">${record.bmi || '--'}</div>
                                        <div class="vital-label">BMI</div>
                                    </div>
                                    <div class="vital">
                                        <div class="vital-value">${record.blood_pressure || '--'}</div>
                                        <div class="vital-label">BP</div>
                                    </div>
                                    <div class="vital">
                                        <div class="vital-value">${record.heart_rate || '--'} bpm</div>
                                        <div class="vital-label">Heart Rate</div>
                                    </div>
                                    <div class="vital">
                                        <div class="vital-value">${record.temperature || '--'}°F</div>
                                        <div class="vital-label">Temp</div>
                                    </div>
                                </div>
                                ${record.treatment ? `<p class="mt-2"><strong>Treatment:</strong> ${record.treatment}</p>` : ''}
                                ${record.notes ? `<p class="text-muted">${record.notes}</p>` : ''}
                                ${record.staff_name ? `<p class="text-muted mt-1">By: ${record.staff_name}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state"><p>No health records found.</p></div>'}
        </div>
    `;
}

// ==================== MEDICINES ====================
async function initMedicines() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('medicines');
    initSidebar('medicines');

    const result = await apiRequest('get_medicines');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const medicines = result.data;
    const container = document.getElementById('medicines-content');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">My Medicines</h1>
        </div>

        <div class="card">
            ${medicines.length > 0 ? medicines.map(med => `
                <div class="medicine-card">
                    <div class="med-icon">${med.is_active ? '💊' : '⏸️'}</div>
                    <div class="med-info">
                        <div class="med-name">${med.medicine_name}</div>
                        <div class="med-dosage">${med.dosage} - ${med.frequency}</div>
                        <div class="med-dosage">${formatDate(med.start_date)} to ${formatDate(med.end_date)}</div>
                    </div>
                    <div>
                        ${med.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>'}
                    </div>
                </div>
            `).join('') : '<div class="empty-state"><p>No medicines prescribed.</p></div>'}
        </div>
    `;
}

// ==================== NOTIFICATIONS ====================
async function initNotifications() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('notifications');
    initSidebar('notifications');

    const result = await apiRequest('get_patient_notifications');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const notifications = result.data;
    const container = document.getElementById('notifications-content');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Notifications</h1>
            <button class="btn btn-outline btn-sm" onclick="markAllRead()">Mark All as Read</button>
        </div>

        <div class="card">
            ${notifications.length > 0 ? notifications.map(notif => `
                <div class="notification-item ${notif.is_read ? '' : 'unread'}" onclick="markRead(${notif.notification_id})">
                    <div class="notification-icon" style="background: ${notif.is_read ? '#e2e8f0' : '#dbeafe'}">
                        ${notif.type === 'appointment_reminder' ? '📅' :
                          notif.type === 'checkup_reminder' ? '🏥' :
                          notif.type === 'medicine_reminder' ? '💊' :
                          notif.type === 'report' ? '📋' :
                          notif.type === 'hospital_message' ? '📢' : '🔔'}
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${formatDateTime(notif.created_at)}</div>
                    </div>
                    ${!notif.is_read ? '<span class="badge badge-primary">New</span>' : ''}
                </div>
            `).join('') : '<div class="empty-state"><p>No notifications.</p></div>'}
        </div>
    `;
}

// Mark notification as read
async function markRead(notificationId) {
    await apiRequest('mark_notification_read', { notification_id: notificationId });
    updateNotificationBadge();
}

// Mark all notifications as read
async function markAllRead() {
    const result = await apiRequest('mark_all_notifications_read');
    showAlert(result.message, result.success ? 'success' : 'danger');
    if (result.success) {
        initNotifications();
        updateNotificationBadge();
    }
}

// ==================== WELLNESS ====================
async function initWellness() {
    const user = await checkAuth('patient');
    if (!user) return;

    initNavbar('wellness');
    initSidebar('wellness');

    const result = await apiRequest('get_wellness_tips');
    if (!result.success) {
        showAlert(result.message, 'danger');
        return;
    }

    const tips = result.data;
    const container = document.getElementById('wellness-content');
    if (!container) return;

    const categoryIcons = {
        'nutrition': '🥗',
        'exercise': '🏃',
        'mental_health': '🧘',
        'sleep': '😴',
        'hydration': '💧',
        'general': '🌿'
    };

    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Wellness Tips</h1>
        </div>

        <div class="grid-2">
            ${tips.map(tip => `
                <div class="tip-card">
                    <h4>${categoryIcons[tip.category] || '🌿'} ${tip.title}</h4>
                    <p>${tip.content}</p>
                </div>
            `).join('')}
        </div>
    `;
}
