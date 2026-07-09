<?php
require __DIR__ . '/db.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
require __DIR__ . '/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ============ CONFIG ============
$to_email    = "hp906054@gmail.com";
$smtp_email  = "hp906054@gmail.com";
$smtp_app_pw = "nwfu eekz mymc ncgy"; // 16-char Gmail App Password, no spaces
$site_name   = "Hiren Keraliya Portfolio";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    echo json_encode(["success" => false, "error" => "Please fill in all fields."]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Invalid email address."]);
    exit;
}

$name = str_replace(["\r", "\n"], '', $name);

// ============ 1. SAVE TO DATABASE ============
$db_saved = false;
$db_error = null;
try {
    $stmt = $pdo->prepare(
        "INSERT INTO contacts (name, email, message) VALUES (:name, :email, :message)"
    );
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':message' => $message,
    ]);
    $db_saved = true;
} catch (PDOException $e) {
    $db_error = $e->getMessage(); // remove once confirmed working
}

// ============ 2. SEND EMAIL ============
$mail_sent = false;
$mail_error = null;
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_email;
    $mail->Password   = $smtp_app_pw;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom($smtp_email, "$site_name");
    $mail->addAddress($to_email);
    $mail->addReplyTo($email, $name);

    $mail->isHTML(false);
    $mail->Subject = "New portfolio message from $name <$email>";
    $mail->Body =
        "You got a new message from your portfolio contact form.\n\n" .
        "----------------------------------------\n" .
        "From   : $name\n" .
        "Email  : $email\n" .
        "----------------------------------------\n\n" .
        "$message\n";

    $mail->send();
    $mail_sent = true;
} catch (Exception $e) {
    $mail_error = $mail->ErrorInfo; // remove once confirmed working
}

// ============ RESPONSE ============
echo json_encode([
    "success"    => $db_saved && $mail_sent,
    "db_saved"   => $db_saved,
    "mail_sent"  => $mail_sent,
    "db_error"   => $db_error,   // delete this line once everything works
    "mail_error" => $mail_error, // delete this line once everything works
]);