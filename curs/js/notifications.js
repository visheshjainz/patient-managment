/**
 * Patient Wellness System - Notifications JavaScript
 * Handles notification display and browser notifications
 */

// Request browser notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Show browser notification
function showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏥</text></svg>'
        });
    }
}

// Play notification sound
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Initialize notifications on page load
document.addEventListener('DOMContentLoaded', function() {
    // Request permission on first interaction
    document.addEventListener('click', requestNotificationPermission, { once: true });

    // Check for new notifications periodically
    if (document.querySelector('.navbar')) {
        setInterval(checkNewNotifications, 60000); // Check every minute
    }
});

// Check for new notifications
async function checkNewNotifications() {
    const result = await apiRequest('get_unread_count');
    if (result.success && result.data.count > 0) {
        const badge = document.querySelector('.nav-badge .badge');
        const currentCount = badge ? parseInt(badge.textContent) : 0;

        if (result.data.count > currentCount) {
            // New notifications arrived
            showBrowserNotification('New Notification', `You have ${result.data.count} unread notifications`);
            playNotificationSound();
        }

        updateNotificationBadge();
    }
}

// Get notification type label
function getNotificationTypeLabel(type) {
    const labels = {
        'appointment_reminder': 'Appointment',
        'checkup_reminder': 'Checkup',
        'medicine_reminder': 'Medicine',
        'report': 'Report',
        'hospital_message': 'Message',
        'general': 'General'
    };
    return labels[type] || 'General';
}

// Get notification type color class
function getNotificationTypeClass(type) {
    const classes = {
        'appointment_reminder': 'badge-info',
        'checkup_reminder': 'badge-success',
        'medicine_reminder': 'badge-warning',
        'report': 'badge-secondary',
        'hospital_message': 'badge-danger',
        'general': 'badge-info'
    };
    return classes[type] || 'badge-info';
}
