<?PHP 

$ADMIN_EMAIL 	= "brett@wejrowski.com"; // Email address that the cart info will be sent to
$EMAIL_SUBJECT 	= "simpleCart(js) has been submitted";


if( !isset($_POST['div']) ){
	echo "no data provided";
	return;
}
	
	
$div = $_POST['div'];

$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

// Additional headers
$headers .= 'To: <' . $ADMIN_EMAIL . ">\r\n";
$headers .= "From: \"simpleCart(js)\" <simplecartjs@simplecartjs.com> \r\n";

$body = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"
	\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">

<html xmlns=\"http://www.w3.org/1999/xhtml\" dir=\"ltr\" lang=\"en-US\">

<head>
<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" /><title>" . $EMAIL_SUBJECT . "</title></head><body>" . $div . "</body></html>";
$subject = $EMAIL_SUBJECT;

mail( $ADMIN_EMAIL, $subject, $body, $headers);

echo "success!";

?>
