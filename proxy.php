<?php
// Simple reverse proxy to Node.js app running on localhost:3000
$target = 'http://localhost:3000' . $_SERVER['REQUEST_URI'];

$ch = curl_init($target);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

// Forward method
$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) === 'host') {
        $headers[] = 'Host: localhost:3000';
    } else {
        $headers[] = "$name: $value";
    }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Forward body for POST/PUT/PATCH
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
if ($response === false) {
    http_response_code(502);
    echo 'Bad Gateway: ' . curl_error($ch);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headersRaw = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

foreach (explode("\r\n", $headersRaw) as $header) {
    if (stripos($header, 'Transfer-Encoding:') === 0) continue;
    if (stripos($header, 'Connection:') === 0) continue;
    if ($header) header($header);
}

http_response_code(curl_getinfo($ch, CURLINFO_HTTP_CODE));
echo $body;
curl_close($ch);
