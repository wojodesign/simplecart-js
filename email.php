<?PHP 

$ADMIN_EMAIL 	= "you@yours.com"; // Email address that the cart info will be sent to
$EMAIL_SUBJECT 	= "simpleCart(js) has been submitted";

if( !isset($_POST['cart']) )
	return_error("Missing info");
	
$div = $_POST['cart'];

$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

// Additional headers
$headers .= 'To: <' . $ADMIN_EMAIL . ">\r\n";
$headers .= "From: \"simpleCart(js)\" <simplecartjs@simplecartjs.com> \r\n";

$body = "<html><head><title>" . $EMAIL_SUBJECT . "</title></head><body>" . $div . "</body></html>";
$subject = $EMAIL_SUBJECT;

email( $ADMIN_EMAIL, $subject, $body, $headers);


?>
