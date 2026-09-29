/**
 * Patient Wellness System - Main JavaScript
 * Core functionality shared across all pages
 */

// API base URL (absolute path from server root)
const API_URL = '/php/api.php';

// Make API request
async function apiRequest(action, data = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...data })
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Show alert message
function showAlert(message, type = 'info', container = null) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    if (container) {
        container.innerHTML = '';
        container.appendChild(alertDiv);
    } else {
        const mainContent = document.querySelector('.main-content') || document.querySelector('.auth-card');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
        }
    }

    setTimeout(() => alertDiv.remove(), 5000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Format time
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClasses = {
        'pending': 'badge-warning',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
        'rescheduled': 'badge-info',
        'completed': 'badge-secondary',
        'cancelled': 'badge-danger'
    };
    const className = statusClasses[status] || 'badge-info';
    return `<span class="badge ${className}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// Check authentication and redirect
async function checkAuth(requiredRole = null) {
    const result = await apiRequest('check_session');

    if (!result.success) {
        const loginPage = requiredRole === 'staff' ? 'hospital/login.html' : 'patient/login.html';
        window.location.href = loginPage;
        return null;
    }

    if (requiredRole && result.data.role !== requiredRole) {
        const loginPage = requiredRole === 'staff' ? 'hospital/login.html' : 'patient/login.html';
        window.location.href = loginPage;
        return null;
    }

    return result.data;
}

// Logout user
async function logout() {
    const result = await apiRequest('logout');
    if (result.success) {
        window.location.href = 'index.html';
    }
}

// Update notification badge in navbar
async function updateNotificationBadge() {
    const result = await apiRequest('get_unread_count');
    if (result.success) {
        const badge = document.querySelector('.nav-badge .badge');
        if (badge) {
            if (result.data.count > 0) {
                badge.textContent = result.data.count > 99 ? '99+' : result.data.count;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }
}

// Initialize navbar
function initNavbar(activePage = '') {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
        <div class="container">
            <a href="index.html" class="navbar-brand">
                <span>🏥</span>
                <span>Patient Wellness</span>
            </a>
            <button class="menu-toggle" onclick="toggleMobileMenu()">☰</button>
            <ul class="navbar-nav" id="navbarNav">
                <li><a href="patient/dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="patient/appointments.html" class="${activePage === 'appointments' ? 'active' : ''}">Appointments</a></li>
                <li><a href="patient/health-records.html" class="${activePage === 'records' ? 'active' : ''}">Records</a></li>
                <li><a href="patient/medicines.html" class="${activePage === 'medicines' ? 'active' : ''}">Medicines</a></li>
                <li><a href="patient/wellness.html" class="${activePage === 'wellness' ? 'active' : ''}">Wellness</a></li>
                <li class="nav-badge">
                    <a href="patient/notifications.html" class="${activePage === 'notifications' ? 'active' : ''}">
                        🔔<span class="badge" style="display:none;">0</span>
                    </a>
                </li>
                <li><a href="patient/profile.html" class="${activePage === 'profile' ? 'active' : ''}">Profile</a></li>
                <li><a href="patient/help.html" class="${activePage === 'help' ? 'active' : ''}">Help</a></li>
                <li><a href="#" onclick="logout(); return false;">Logout</a></li>
            </ul>
        </div>
    `;
    document.body.insertBefore(navbar, document.body.firstChild);
    updateNotificationBadge();
}

// Initialize sidebar
function initSidebar(activePage = '') {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    sidebar.innerHTML = `
        <ul class="sidebar-nav">
            <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">📊 Dashboard</a></li>
            <li><a href="appointments.html" class="${activePage === 'appointments' ? 'active' : ''}">📅 Appointments</a></li>
            <li><a href="health-records.html" class="${activePage === 'records' ? 'active' : ''}">📋 Health Records</a></li>
            <li><a href="medicines.html" class="${activePage === 'medicines' ? 'active' : ''}">💊 Medicines</a></li>
            <li><a href="wellness.html" class="${activePage === 'wellness' ? 'active' : ''}">🌿 Wellness Tips</a></li>
            <li><a href="notifications.html" class="${activePage === 'notifications' ? 'active' : ''}">🔔 Notifications</a></li>
            <li><a href="profile.html" class="${activePage === 'profile' ? 'active' : ''}">👤 Profile</a></li>
            <li><a href="help.html" class="${activePage === 'help' ? 'active' : ''}">❓ Help & FAQ</a></li>
            <li><a href="#" onclick="logout(); return false;">🚪 Logout</a></li>
        </ul>
    `;
    document.body.insertBefore(sidebar, document.body.firstChild);
}

// Toggle mobile menu
function toggleMobileMenu() {
    const nav = document.getElementById('navbarNav');
    const sidebar = document.getElementById('sidebar');
    if (nav) nav.classList.toggle('active');
    if (sidebar) sidebar.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const nav = document.getElementById('navbarNav');
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.menu-toggle');

    if (nav && nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('active');
    }
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});

// Calculate BMI
function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return 0;
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(2);
}

// Get BMI category
function getBMICategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', class: 'bmi-underweight' };
    if (bmi < 25) return { label: 'Normal', class: 'bmi-normal' };
    if (bmi < 30) return { label: 'Overweight', class: 'bmi-overweight' };
    return { label: 'Obese', class: 'bmi-obese' };
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone
function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
}
