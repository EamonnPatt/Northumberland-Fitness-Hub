<?php
// Handles both the "Contact" and "Join The Club" forms on the site.
// Sends mail via PHP's built-in mail() — works on standard cPanel hosting
// with no extra services or credentials required.

declare(strict_types=1);

header('Content-Type: application/json');

const DESTINATION_EMAIL = 'info@northumberlandfitness.com';

function respond(bool $ok, string $message, int $status = 200): void {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(false, 'Invalid request.', 400);
}

// Strips CR/LF so form input can't be used to inject extra mail headers.
function clean(string $value): string {
    return trim(str_replace(["\r", "\n"], '', $value));
}

function required(array $data, string $key): string {
    $value = isset($data[$key]) && is_string($data[$key]) ? clean($data[$key]) : '';
    if ($value === '') {
        respond(false, "Missing required field: $key", 422);
    }
    return $value;
}

$type = isset($data['type']) && $data['type'] === 'register' ? 'register' : 'contact';

if ($type === 'contact') {
    $name = required($data, 'name');
    $email = required($data, 'email');
    $message = isset($data['message']) && is_string($data['message']) ? trim($data['message']) : '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please enter a valid email address.', 422);
    }
    if ($message === '') {
        respond(false, 'Missing required field: message', 422);
    }

    $subject = 'New contact form message — Northumberland Fitness';
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message\n";
} else {
    $firstName = required($data, 'firstName');
    $lastName = required($data, 'lastName');
    $email = required($data, 'email');
    $phone = isset($data['phone']) && is_string($data['phone']) ? clean($data['phone']) : '';
    $membership = isset($data['membership']) && is_string($data['membership']) ? clean($data['membership']) : '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please enter a valid email address.', 422);
    }

    $subject = 'New membership signup — Northumberland Fitness';
    $body = "First name: $firstName\nLast name: $lastName\nEmail: $email\nPhone: $phone\nMembership: $membership\n";
}

$headers = "From: no-reply@" . preg_replace('/^www\./', '', clean($_SERVER['HTTP_HOST'] ?? 'localhost')) . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

$sent = mail(DESTINATION_EMAIL, $subject, $body, $headers);

if (!$sent) {
    respond(false, 'Could not send your message. Please try again later.', 500);
}

respond(true, "Thanks! We'll be in touch soon.");
