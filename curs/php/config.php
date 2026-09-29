<?php
/**
 * Database Configuration - SQLite
 * Patient Wellness System
 */

define('DB_FILE', __DIR__ . '/../database/wellness_system.db');

/**
 * Get database connection (PDO SQLite)
 * @return PDO
 */
function getDBConnection() {
    try {
        $conn = new PDO('sqlite:' . DB_FILE);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $conn;
    } catch (PDOException $e) {
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]));
    }
}

/**
 * Send JSON response
 */
function sendResponse($success, $message = '', $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Sanitize input
 */
function sanitize($conn, $input) {
    if (is_array($input)) {
        return array_map(function($item) use ($conn) {
            return sanitize($conn, $item);
        }, $input);
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate required fields
 */
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing[] = $field;
        }
    }
    return $missing;
}
