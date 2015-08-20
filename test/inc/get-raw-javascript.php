<?php

header('Content-Type: application/javascript');

$url = $_GET['file'];
$urlParts = parse_url($url);
if ($urlParts['scheme'] === "file") {
    exit;
}
$ch = curl_init($url);
curl_exec($ch);
curl_close($ch);



