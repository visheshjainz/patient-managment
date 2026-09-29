<?php
require_once __DIR__ . '/../php/config.php';

$conn = getDBConnection();

echo "=== ALL USER CREDENTIALS ===\n\n";

$stmt = $conn->query("SELECT user_id, email, role, full_name, phone FROM users ORDER BY role, user_id");
$users = $stmt->fetchAll();

echo "PATIENTS:\n";
echo str_repeat("-", 80) . "\n";
printf("%-5s %-25s %-20s %-15s\n", "ID", "Email", "Name", "Phone");
echo str_repeat("-", 80) . "\n";
foreach ($users as $u) {
    if ($u['role'] === 'patient') {
        printf("%-5s %-25s %-20s %-15s\n", $u['user_id'], $u['email'], $u['full_name'], $u['phone']);
    }
}

echo "\n\nSTAFF:\n";
echo str_repeat("-", 80) . "\n";
printf("%-5s %-25s %-20s %-15s\n", "ID", "Email", "Name", "Phone");
echo str_repeat("-", 80) . "\n";
foreach ($users as $u) {
    if ($u['role'] === 'staff') {
        printf("%-5s %-25s %-20s %-15s\n", $u['user_id'], $u['email'], $u['full_name'], $u['phone']);
    }
}

echo "\n\nAll passwords are: password123\n";
