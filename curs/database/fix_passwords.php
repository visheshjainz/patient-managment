<?php
require_once __DIR__ . '/../php/config.php';

$conn = getDBConnection();
$password = 'password123';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ?");
$stmt->execute([$hash]);

echo "All passwords updated to 'password123'\n";
echo "Hash: " . $hash . "\n";
