<?php
require_once __DIR__ . '/../php/config.php';

$dbFile = __DIR__ . '/wellness_system.db';
if (file_exists($dbFile)) {
    unlink($dbFile);
}

$conn = getDBConnection();
$sql = file_get_contents(__DIR__ . '/wellness_system.sql');
$conn->exec($sql);

echo "Database initialized successfully!\n";
echo "Database file: " . $dbFile . "\n";
