<?php
// ============ DATABASE CONFIG — edit these ============
$db_host = "localhost";
$db_name = "portfolio_db";
$db_user = "root";
$db_pass = "";   // default blank on XAMPP — change if you set one
$db_port = "3307"; // default 3306 on XAMPP — change if you set one

// ============ CONNECT ============
try {
    $pdo = new PDO(
        "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "error" => "Database connection failed."]));
}