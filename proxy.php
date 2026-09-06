<?php
/**
 * Reverse proxy minimal cPanel (Apache + PHP) -> application Next.js sur 127.0.0.1:3000.
 *
 * - Transmet la méthode, les en-têtes et le corps de la requête.
 * - Ajoute les en-têtes X-Forwarded-* (nécessaires aux server actions Next.js
 *   et au hash d'IP des statistiques).
 * - Conserve TOUS les en-têtes Set-Cookie (Auth.js en émet plusieurs).
 */
$upstream = 'http://127.0.0.1:3000';
$target = $upstream . $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 60,
    // On laisse Next répondre en clair : PHP/Apache gèrent la compression.
    CURLOPT_ENCODING => '',
]);

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '';

$headers = [
    'Host: ' . $host,
    'X-Forwarded-Host: ' . $host,
    'X-Forwarded-Proto: ' . $proto,
    'X-Forwarded-For: ' . $clientIp,
    'X-Real-IP: ' . $clientIp,
];
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if (in_array($lower, ['host', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for', 'x-real-ip', 'accept-encoding', 'content-length', 'expect'], true)) {
        continue;
    }
    $headers[] = "$name: $value";
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
    $body = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    // Sans enable_post_data_reading=Off (.user.ini), PHP consomme les corps
    // multipart/form-data et php://input est vide : on reconstruit alors le
    // corps à partir de $_POST / $_FILES avec une nouvelle frontière.
    if ($body === '' && stripos($contentType, 'multipart/form-data') === 0 && (!empty($_POST) || !empty($_FILES))) {
        $boundary = '----LinkfreeProxy' . bin2hex(random_bytes(12));
        $body = '';
        foreach ($_POST as $name => $value) {
            foreach ((array) $value as $v) {
                $body .= "--$boundary\r\nContent-Disposition: form-data; name=\"$name\"\r\n\r\n$v\r\n";
            }
        }
        foreach ($_FILES as $name => $file) {
            if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) continue;
            $body .= "--$boundary\r\nContent-Disposition: form-data; name=\"$name\"; filename=\"" . addslashes($file['name']) . "\"\r\n"
                . "Content-Type: " . ($file['type'] ?: 'application/octet-stream') . "\r\n\r\n"
                . file_get_contents($file['tmp_name']) . "\r\n";
        }
        $body .= "--$boundary--\r\n";
        $headers = array_values(array_filter($headers, fn($h) => stripos($h, 'Content-Type:') !== 0));
        $headers[] = 'Content-Type: multipart/form-data; boundary=' . $boundary;
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Bad Gateway: l'application est indisponible (" . curl_error($ch) . ")";
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$rawHeaders = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

http_response_code($statusCode);

// Seul le dernier bloc d'en-têtes compte (cURL peut en renvoyer plusieurs, ex. 100 Continue).
$blocks = preg_split("/\r\n\r\n/", trim($rawHeaders));
$lastBlock = end($blocks);
foreach (explode("\r\n", $lastBlock) as $line) {
    if ($line === '' || stripos($line, 'HTTP/') === 0) continue;
    $lower = strtolower($line);
    if (strpos($lower, 'transfer-encoding:') === 0) continue;
    if (strpos($lower, 'connection:') === 0) continue;
    if (strpos($lower, 'content-encoding:') === 0) continue;
    if (strpos($lower, 'content-length:') === 0) continue;
    // replace=false pour cumuler les Set-Cookie au lieu de les écraser.
    header($line, strpos($lower, 'set-cookie:') !== 0);
}

echo $body;
