<?php

header('Content-Type: application/javascript');

$url = $_GET['file'];

$ch = curl_init($url);
curl_exec($ch);
curl_close($ch);



