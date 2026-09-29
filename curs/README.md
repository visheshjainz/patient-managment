# Patient Wellness System

A comprehensive college-level web development project for healthcare management, built with HTML5, CSS3, Vanilla JavaScript, PHP, and MySQL.

## Project Overview

The Patient Wellness System is a full-stack web application that connects patients and hospitals for managing appointments, health records, medications, notifications, and wellness tips.

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** PHP (minimal, action-based API)
- **Database:** MySQL
- **Authentication:** PHP Sessions with password hashing

## Project Structure

```
Patient-Wellness-System/
├── index.html              # Landing page
├── patient/                # Patient portal pages
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── appointments.html
│   ├── health-records.html
│   ├── medicines.html
│   ├── notifications.html
│   ├── wellness.html
│   └── help.html
├── hospital/               # Hospital staff portal pages
│   ├── login.html
│   ├── dashboard.html
│   ├── patients.html
│   ├── appointments.html
│   ├── records.html
│   ├── notifications.html
│   └── reports.html
├── css/                    # Stylesheets
│   ├── style.css           # Main styles
│   ├── patient.css         # Patient-specific styles
│   ├── hospital.css        # Hospital-specific styles
│   └── responsive.css      # Responsive design
├── js/                     # JavaScript files
│   ├── main.js             # Core functionality
│   ├── patient.js          # Patient-side logic
│   ├── hospital.js         # Hospital-side logic
│   └── notifications.js    # Notification handling
├── php/                    # Backend
│   ├── config.php          # Database configuration
│   └── api.php             # Action-based API endpoint
├── database/
│   └── wellness_system.sql # Database schema with sample data
└── README.md
```

## Database Setup

1. Install XAMPP (or any PHP + MySQL environment)
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database named `wellness_system`
5. Import the `database/wellness_system.sql` file
6. The database will be created with all tables and sample data

## Configuration

Edit `php/config.php` to match your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');        // Your MySQL username
define('DB_PASSWORD', '');            // Your MySQL password
define('DB_NAME', 'wellness_system');
```

## Running the Project

1. Copy the project folder to your web server root (e.g., `C:\xampp\htdocs\curs`)
2. Start XAMPP (Apache + MySQL)
3. Open your browser and navigate to:
   - Landing page: `http://localhost/curs/`
   - Patient login: `http://localhost/curs/patient/login.html`
   - Hospital login: `http://localhost/curs/hospital/login.html`

## Demo Credentials

### Patient Login
| Email | Password |
|-------|----------|
| patient1@demo.com | password123 |
| patient2@demo.com | password123 |
| patient3@demo.com | password123 |

### Hospital Staff Login
| Email | Password |
|-------|----------|
| staff1@demo.com | password123 |
| staff2@demo.com | password123 |

## Features

### Patient Portal
- Registration and login with PHP sessions
- Dashboard with health overview and wellness score
- Health metrics tracking (weight, BMI, BP, heart rate)
- Profile management
- Appointment booking and history
- Health records timeline
- Medicine tracking
- Database-driven notifications with unread count
- Wellness tips
- Help & FAQ

### Hospital Portal
- Staff login
- Dashboard with statistics
- Patient management and search
- Appointment approval, rejection, and rescheduling
- Health record creation and management
- Medicine prescription management
- Patient notification system
- Reports and analytics

### Notification System
- Database-driven notifications
- Types: appointment reminders, checkup reminders, medicine reminders, reports, hospital messages
- Read/unread status tracking
- Unread count badge
- Optional browser notifications

## Security Features

- PHP session-based authentication
- Password hashing with `password_hash()`
- Prepared SQL statements to prevent SQL injection
- Input sanitization and validation
- Role-based access control (patient/staff)
- No sensitive data stored in localStorage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (responsive design)

## Notes

- This is a college project for educational purposes
- All medical data is sample/demo data only
- Browser notifications are optional and require user permission
- The main notification system works through the application database
