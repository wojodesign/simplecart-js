var NextId=1,Custom="Custom",GoogleCheckout="GoogleCheckout",PayPal="PayPal",Email="Email",AustralianDollar=AUD="AUD",CanadianDollar=CAD="CAD",CzechKoruna=CZK="CZK",DanishKrone=DKK="DKK",Euro=EUR="EUR",HongKongDollar=HKD="HKD",HungarianForint=HUF="HUF",IsraeliNewSheqel=ILS="ILS",JapaneseYen=JPY="JPY",MexicanPeso=MXN="MXN",NorwegianKrone=NOK="NOK",NewZealandDollar=NZD="NZD",PolishZloty=PLN="PLN",PoundSterling=GBP="GBP",SingaporeDollar=SGD="SGD",SwedishKrona=SEK="SEK",SwissFranc=CHF="CHF",USDollar=USD="USD";




function Cart(){
/* PUBLIC: */

	/* member variables */
	this.Version = '1.9.9.2';
	this.Shelf = new Shelf();
	this.items = new Object();
	this.isLoaded = false;
	this.pageIsReady = false;
	this.quantity = 0;
	this.total = 0;
	this.taxRate = 0;
	this.taxCost = 0;
	this.shippingRate = 0;
	this.shippingCost = 0;
	this.currency = USD;
	this.checkoutTo = Custom;
	this.email = "";
	this.merchantId	 = "";
	this.cartHeaders = ['Name','Price','Quantity','Total'];
	/* 
		cart headers: 
		you can set these to which ever order you would like, and the cart will display the appropriate headers
		and item info.  any field you have for the items in the cart can be used, and 'Total' will automatically 
		be price*quantity.  
		
		there are keywords that can be used:
			
			1) "_input" - the field will be a text input with the value set to the given field. when the user
				changes the value, it will update the cart.  this can be useful for quantity. (ie "Quantity_input")
			
			2) "increment" - a link with "+" that will increase the item quantity by 1
			
			3) "decrement" - a link with "-" that will decrease the item quantity by 1
			
			4) "remove" - a link that will remove the item from the cart 
			
			5) "_image" or "Image" - the field will be an img tag with the src set to the value. You can simply use "Image" if
				you set a field in the items called "Image".  If you have a field named something else, like "Thumb", you can add
				the "_image" to create the image tag (ie "Thumb_image").
				
			6) "_noHeader" - this will skip the header for that field (ie "increment_noHeader")
		
	
	*/
	
	


	/******************************************************
			add/remove items to cart  
 	 ******************************************************/

	this.add = function () {
		/* load cart values if not already loaded */
		if( !this.pageIsReady 	) { 
			this.initializeView(); 
			this.update();	
		}
		if( !this.isLoaded 		) { 
			this.load(); 
			this.update();	
		}
		
		var newItem = new CartItem();
		
		/* check to ensure arguments have been passed in */
		if( !arguments || arguments.length == 0 ){
			error( 'No values passed for item.');
			return;
		}
		
		if( arguments[0] && typeof( arguments[0] ) != 'string' && typeof( arguments[0] ) != 'number'  ){ 
			arguments = arguments[0]; 
		}
	
		newItem.parseValuesFromArray( arguments );
		newItem.checkQuantityAndPrice();
		
		/* if the item already exists, update the quantity */
		if( this.hasItem(newItem) ) {
			var id=this.hasItem(newItem);
			this.items[id].quantity= parseInt(this.items[id].quantity) + parseInt(newItem.quantity);
		} else {
			this.items[newItem.id] = newItem;
		}	
		
		this.update();
	}
	
	
	this.remove = function( id ){
		var tempArray = new Object();
		for( var item in this.items ){
			if( item != id ){ 
				tempArray[item] = this.items[item]; 
			}
		}
		this.items = tempArray;
	}
	
	
	this.empty = function () {
		simpleCart.items = new Object();
		simpleCart.update();
	}


	/******************************************************
			 checkout management 
     ******************************************************/

	this.checkout = function() {
		if( simpleCart.quantity == 0 ){
			error("Cart is empty");
			return;
		}
		switch( simpleCart.checkoutTo ){
			case PayPal:
				simpleCart.paypalCheckout();
				break;
			case GoogleCheckout:
				simpleCart.googleCheckout();
				break;
			case Email:
				simpleCart.emailCheckout();
				break;
			default:
				simpleCart.customCheckout();
				break;
		}
	}
	
	this.paypalCheckout = function() {
		
		var winpar = "scrollbars,location,resizable,status",
			strn  = "https://www.paypal.com/cgi-bin/webscr?cmd=_cart" +
		   			"&upload=1" +
		        	"&business=" + this.email + 
					"&currency_code=" + this.currency,
			counter = 1,
			itemsString = "";
			
		for( var current in this.items ){
			var item = this.items[current];
			
			var optionsString = "";
			for( var field in item ){
				if( typeof(item[field]) != "function" && field != "id" && field != "price" && field != "quantity" && field != "name" ) {
					optionsString = optionsString + "&" + field + "=" + item[field] ; 
				}
			}
			optionsString = optionsString.substring(1);
			
			itemsString = itemsString 	+ "&item_name_" 	+ counter + "=" + item["name"]  +
									 	  "&item_number_" 	+ counter + "=" + counter +
										  "&quantity_"		+ counter + "=" + item.quantity +
										  "&amount_"		+ counter + "=" + this.currencyStringForPaypalCheckout( item.price ) + 
										  "&on0_" 			+ counter + "=" + "Options" + 
										  "&os0_"			+ counter + "=" + optionsString;
			counter++;
			
			
		}
		strn = strn + itemsString ;
		window.open (strn, "paypal", winpar);
	}

	this.googleCheckout = function() {
		if( this.currency != USD && this.currency != GBP ){
			error( "Google Checkout only allows the USD and GBP for currency.");
			return;
		} else if( this.merchantId == "" || this.merchantId == null ){
			error( "No merchant Id for google checkout supplied.");
			return;
		} 
		
		var form = document.createElement("form"),
			counter = 1;
		form.style.display = "none";
		form.method = "POST";
		form.action = "https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/" + 
						this.merchantId;
		form.acceptCharset = "utf-8";
		
		for( var current in this.items ){
			var item 				= this.items[current];
			form.appendChild( this.createHiddenElement( "item_name_" 		+ counter, item["name"] 		) );
			form.appendChild( this.createHiddenElement( "item_quantity_" 	+ counter, item["quantity"] 	) );
			form.appendChild( this.createHiddenElement( "item_price_" 		+ counter, item["price"] 		) );
			form.appendChild( this.createHiddenElement( "item_currency_" 	+ counter, this.currency 	) );
			form.appendChild( this.createHiddenElement( "item_tax_rate_" 	+ counter, this.taxRate 	) );
			form.appendChild( this.createHiddenElement( "_charset_"					 , ""				) );
			
			var descriptionString = "";
			
			for( var field in item){
				if( typeof( item[field] ) != "function" && 
									field != "id" 		&& 
									field != "quantity"	&& 
									field != "price" )
				{
						descriptionString = descriptionString + ", " + field + ": " + item[field];				
				}
			}
			descriptionString = descriptionString.substring( 1 );
			form.appendChild( this.createHiddenElement( "item_description_" + counter, descriptionString) );
		}
		
		document.body.appendChild( form );
		form.submit();
		document.body.removeChild( form );
	}
	
	
	
	this.emailCheckout = function() {
		return;
	}
	
	this.customCheckout = function() {
		return;
	}




/* PRIVATE : */

	/******************************************************
				data storage and retrival 
	 ******************************************************/
	
	/* load cart from cookie */
	this.load = function () {
		/* initialize variables and items array */
		this.items = new Object();
		this.total = 0.00;
		this.quantity = 0;
		
		/* retrieve item data from cookie */
		if( readCookie('simpleCart') ){
			var data = unescape(readCookie('simpleCart')).split('++');
			for(var x=0, xlen=data.length;x<xlen;x++){
			
				var info = data[x].split('||');
				var newItem = new CartItem();
			
				if( newItem.parseValuesFromArray( info ) ){
					newItem.checkQuantityAndPrice();
					/* store the new item in the cart */
					this.items[newItem.id] = newItem;
				}
 			}
		}
		this.isLoaded = true;
	}
	
	
	
	/* save cart to cookie */
	this.save = function () {
		var dataString = "";
		for( var item in this.items ){
			dataString = dataString + "++" + this.items[item].print();
		}
		createCookie('simpleCart', dataString.substring( 2 ), 30 );
	}
	
	

	
		
	/******************************************************
				 view management 
	 ******************************************************/
	
	this.initializeView = function() {
		this.totalOutlets 			= getElementsByClassName('simpleCart_total');
		this.quantityOutlets 		= getElementsByClassName('simpleCart_quantity');
		this.cartDivs 				= getElementsByClassName('simpleCart_items');
		this.taxCostOutlets			= getElementsByClassName('simpleCart_taxCost');
		this.taxRateOutlets			= getElementsByClassName('simpleCart_taxRate');
		this.shippingCostOutlets	= getElementsByClassName('simpleCart_shippingCost');
		this.shippingRateOutlets	= getElementsByClassName('simpleCart_shippingRate');
		this.finalTotalOutlets		= getElementsByClassName('simpleCart_finalTotal');
		
		
		this.addEventToArray( getElementsByClassName('simpleCart_checkout') , simpleCart.checkout , "click");
		this.addEventToArray( getElementsByClassName('simpleCart_empty') 	, simpleCart.empty , "click" );
		
		
		this.Shelf.readPage();
			
		this.pageIsReady = true;
		
	}
	
	
	
	this.updateView = function() {
		this.updateViewTotals();
		if( this.cartDivs && this.cartDivs.length > 0 ){ 
			this.updateCartView(); 
		}
	}
	
	this.updateViewTotals = function() {
		var outlets = [ ["quantity"		, "none"		] , 
						["total"		, "currency"	] , 
						["shippingRate"	, "percentage"	] , 
						["shippingCost"	, "currency"	] ,
						["taxCost"		, "currency"	] ,
						["taxRate"		, "percentage"	] ,
						["finalTotal"	, "currency"	] ];
						
		for( var x=0,xlen=outlets.length; x<xlen;x++){
			
			var arrayName = outlets[x][0] + "Outlets",
				outputString;
				
			for( var element in this[ arrayName ] ){
				switch( outlets[x][1] ){
					case "none":
						outputString = "" + this[outlets[x][0]];
						break;
					case "currency":
						outputString = this.valueToCurrencyString( this[outlets[x][0]] );
						break;
					case "percentage":
						outputString = this.valueToPercentageString( this[outlets[x][0]] );
						break;
					default:
						outputString = "" + this[outlets[x][0]];
						break;
				}
				this[arrayName][element].innerHTML = "" + outputString;
			}
		}
	}
	
	this.updateCartView = function() {
		var newRows = new Array();
		
		/* create headers row */
		var newRow = document.createElement('div');
		for( var header in this.cartHeaders ){
			var newCell = document.createElement('div'),
				headerInfo = this.cartHeaders[header].split("_");
			
			if( !( headerInfo[1] == "noHeader") ){
				newCell.innerHTML = headerInfo[0];
				newCell.className = "item" + headerInfo[0];
				newRow.appendChild( newCell );
			}
		}
		newRow.className = "cartHeaders";
		newRows[0] = newRow;
		
		
		/* create a row for each item in the cart */
		var x=1;
		for( var current in this.items ){
			var newRow = document.createElement('div'),
				item = this.items[current];
			
			for( var header in this.cartHeaders ){
				
				var newCell = document.createElement('div'),
					info = this.cartHeaders[header].split("_"),
					outputValue;
				
				switch( info[0] ){
					case "Total":
					case "total":
						outputValue = parseFloat(item['price'])*parseInt(item['quantity']);
						break;
					case "increment":
					case "Increment":
						outputValue = "+";
						break
					case "decrement":
					case "Decrement":
						outputValue = "-";
						break;
					case "remove":
					case "Remove":
						outputValue = "Remove";
						break;
					default: 
						outputValue = item[ info[0].toLowerCase() ] ? item[info[0].toLowerCase()] : " ";
						break;
				}	
				
				
				/* formatting outputs */
				
				if( info[0] == "Total" || 
					info[0] == "Price" ||
					info[1] == "currency"){
						
					outputValue = this.valueToCurrencyString( outputValue );
				
				} 
				if( (info[1] && info[1].toLowerCase() == "image") ||
						   (info[0] && info[0].toLowerCase() == "image") ){
					
					outputValue = this.valueToImageString( outputValue );		
					
				} else if( info[1] == "input" ){
					
					outputValue = this.valueToTextInput( outputValue , "onchange=\"simpleCart.items[\'" + item["id"] + "\'].set(\'" + info[0].toLowerCase() + "\' , this.value);\""  );
				
				}else if( outputValue == "+" ){
					outputValue = this.valueToLink( outputValue , "javascript:;" , "onclick=\"simpleCart.items[\'" + item["id"] + "\'].increment();\"" );
				}else if( outputValue == "-" ){
					outputValue = this.valueToLink( outputValue , "javascript:;" , "onclick=\"simpleCart.items[\'" + item["id"] + "\'].decrement();\"" );
				}else if( outputValue == "Remove"){
					outputValue = this.valueToLink( outputValue , "javascript:;" , "onclick=\"simpleCart.items[\'" + item["id"] + "\'].remove();\"" );
				}
						  
				newCell.innerHTML = outputValue;
				newCell.className = "item" + info[0];
				newRow.appendChild( newCell );
			}			
			newRow.className = "itemContainer";
			newRows[x] = newRow;
			x++;
		}
		
		
		
		for( var current in this.cartDivs ){
			
			/* delete current rows in div */
			var div = this.cartDivs[current];
			while( div.childNodes[0] ){
				div.removeChild( div.childNodes[0] );
			}
			
			for(var j=0, jLen = newRows.length; j<jLen; j++){
				div.appendChild( newRows[j] );
			}
			
			
		}
	}

	this.addEventToArray = function ( array , functionCall , theEvent ) {
		for( var outlet in array ){
			var element = array[outlet];
			if( element.addEventListener ) {
				element.addEventListener(theEvent, functionCall , false );
			} else if( element.attachEvent ) {
			  	element.attachEvent( "on" + theEvent, functionCall );
			}
		}
	}
	
	
	this.createHiddenElement = function ( name , value ){
		var element = document.createElement("input");
		element.type = "hidden";
		element.name = name;
		element.value = value;
		return element;
	}
	
	
	
	/******************************************************
				Currency management
	 ******************************************************/
	
	this.currencySymbol = function() {		
		switch(this.currency){
			case JPY:
				return "&yen;";
				break;
			case EUR:
				return "&euro;";
				break;
			case GBP:
				return "&pound;";
				break;
			case USD:
			case CAD:
			case AUD:
			case NZD:
			case HKD:
			case SGD:
				return "&#36;";
				break;
			default:
				return "";
				break;
		}
	}
	
	
	this.currencyStringForPaypalCheckout = function( value ){
		if( this.currencySymbol == "&#36;" ){
			return "$" + parseFloat( value );
		} else {
			return "" + parseFloat(value );
		}
	}
	
	/******************************************************
				Formatting
	 ******************************************************/
	
	
	this.valueToCurrencyString = function( value ) {
		var currencyString = "" + parseFloat(value).toFixed(2);
		if( currencyString.length > 6 ){
			var newCurrencyString = "";
			for( var x=currencyString.length-1, placeValueCounter=1; x>=0;x--,placeValueCounter++){
				newCurrencyString = newCurrencyString + currencyString.substr(x,1);
				if( placeValueCounter == 3 ){
					if( x<currencyString.length-4 && x > 0 ) { newCurrencyString = newCurrencyString + ","; }
					placeValueCounter = 0;
				}
			}
			currencyString = newCurrencyString.reverse();
		}
		return this.currencySymbol() + currencyString;
	}
	
	this.valueToPercentageString = function( value ){
		return parseFloat( 100*value ).toFixed(0) + "%"
	}
	
	this.valueToImageString = function( value ){
		if( value.match(/<\s*img.*src\=/) ){
			return value;
		} else {
			return "<img src=\"" + value + "\" />";
		}
	}
	
	this.valueToTextInput = function( value , html ){
		return "<input type=\"text\" value=\"" + value + "\" " + html + " />";
	}
	
	this.valueToLink = function( value, link, html){
		return "<a href=\"" + link + "\" " + html + " >" + value + "</a>";
	}
	
	/******************************************************
				Duplicate management
	 ******************************************************/
	
	this.hasItem = function ( item ) {
		for( var current in this.items ) {
			var testItem = this.items[current];
			var matches = true;
			for( var field in item ){
				if( typeof( item[field] ) != "function"	&& 
					field != "quantity"  				&& 
					field != "id" 						){
					if( item[field] != testItem[field] ){
						matches = false;
					}
				}	
			}
			if( matches ){ 
				return current; 
			}
		}
		return false;
	}
	
	
	
	
	/******************************************************
				Cart Update managment
	 ******************************************************/
	
	this.update = function() {
		if( !simpleCart.isLoaded ){
			simpleCart.load();
		} 
		if( !simpleCart.pageIsReady ){
			simpleCart.initializeView();
		}
		this.updateTotals();
		this.updateView();
		this.save();
	}
	
	this.updateTotals = function() {
		this.total = 0 ;
		this.quantity  = 0;
		for( var current in this.items ){
			var item = this.items[current];
			if( item["quantity"] < 1 ){ 
				item.remove();
			} else if( item["quantity"] != null && item["quantity"] != "undefined" ){
				this.quantity = parseInt(this.quantity) + parseInt(item["quantity"]); 
			}
			if( item["price"] ){ 
				this.total = parseFloat(this.total) + parseInt(item["quantity"])*parseFloat(item["price"]); 
			}
		}
		this.shippingCost = parseFloat(this.total)*this.shippingRate;
		this.taxCost = parseFloat(this.total)*this.taxRate;
		this.finalTotal = this.shippingCost + this.taxCost + this.total;
	}
	
	this.initialize = function() {
		simpleCart.initializeView();
		simpleCart.load();
		simpleCart.update();
	}
				
}

/********************************************************************************************************
 *			Cart Item Object
 ********************************************************************************************************/

function CartItem() {
	this.id = "c" + NextId++;
	
	this.set = function ( field , value ){
		field = field.toLowerCase();
		if( typeof( this[field] ) != "function" && field != "id" ){
			if( field == "quantity" ){
				value = value.replace( /[^(\d|\.)]*/gi , "" );
				value = value.replace(/,*/gi, "");
				value = parseInt(value);
			} else if( field == "price"){
				value = value.replace( /[^(\d|\.)]*/gi, "");
				value = value.replace(/,*/gi , "");
				value = parseFloat( value );
			}
			if( typeof(value) == "number" && isNaN( value ) ){
				error( "Improperly formatted input.");
			} else {
				this[field] = value;
				this.checkQuantityAndPrice();
			}			
		} else {
			error( "Cannot change " + field + ", this is a reserved field.");
		}
		simpleCart.update();
	}
	
	this.increment = function(){
		this.quantity = parseInt(this.quantity) + 1;
		simpleCart.update();
	}
	
	this.decrement = function(){
		if( parseInt(this.quanity) < 2 ){
			this.remove();
		} else {
			this.quantity = parseInt(this.quantity) - 1;
			simpleCart.update();
		}
	}
	
	this.print = function () {
		var returnString = '';
		for( var field in this ) {
			if( typeof( this[field] ) != "function" ) {
				returnString+= escape(field) + "=" + escape(this[field]) + "||";
			}
		}
		return returnString.substring(0,returnString.length-2);
	}
	
	
	this.checkQuantityAndPrice = function() {
		if( this.quantity == null || this.quantity == 'undefined'){ 
			this.quantity = 1;
			error('No quantity for item.');
		} else {
			this.quantity = ("" + this.quantity).replace(/,*/gi, "" );
			this.quantity = parseInt( ("" + this.quantity).replace( /[^(\d|\.)]*/gi, "") ); 
			if( isNaN(this.quantity) ){
				error('Quantity is not a number.');
				this.quantity = 1;
			}
		}
				
		if( this.price == null || this.price == 'undefined'){
			this.price=0.00;
			error('No price for item or price not properly formatted.');
		} else {
			this.price = ("" + this.price).replace(/,*/gi, "" );
			this.price = parseFloat( ("" + this.price).replace( /[^(\d|\.)]*/gi, "") ); 
			if( isNaN(this.price) ){
				error('Price is not a number.');
				this.price = 0.00;
			}
		}
	}
	
	
	this.parseValuesFromArray = function( array ) {
		if( array && array.length && array.length > 0) {
			for(var x=0, xlen=array.length; x<xlen;x++ ){
			
				/* ensure the pair does not have key delimeters */
				array[x].replace(/||/, "| |");
				array[x].replace(/\+\+/, "+ +");
			
				/* split the pair and save the unescaped values to the item */
				var value = array[x].split('=');
				if( value.length>1 ){
					if( value.length>2 ){
						for(var j=2, jlen=value.length;j<jlen;j++){
							value[1] = value[1] + "=" + value[j];
						}
					}
					this[ unescape(value[0]).toLowerCase() ] = unescape(value[1]);
				}
			}
			return true;
		} else {
			return false;
		}
	}
	
	this.remove = function() {
		simpleCart.remove(this.id);
		simpleCart.update();
	}
	
}

/********************************************************************************************************
 *			Shelf Object for managing items on shelf that can be added to cart
 ********************************************************************************************************/

function Shelf(){
	this.items = new Object();
	
	this.readPage = function () {
		this.items = new Object();
		var newItems = getElementsByClassName( "simpleCart_shelfItem" );
		for( var current in newItems ){
			var newItem = new ShelfItem();
			this.checkChildren( newItems[current] , newItem );
			this.items[newItem.id] = newItem;
		}
	}
	
	this.checkChildren = function ( item , newItem) {
		
		for(var x=0;item.childNodes[x];x++){
			
			var node = item.childNodes[x];
			if( node.className && node.className.match(/item_/) ){
				
				var data=node.className.split('_');
				
				if( data[1] == "add" || data[1] == "Add" ){
					var tempArray = new Array();
					tempArray.push( node );
					simpleCart.addEventToArray( tempArray , simpleCart.Shelf.addToCart , "click");
					node.id = newItem.id;
				} else {
					newItem[data[1]]  = node;
				}
			}		
			if( node.childNodes[0] ){ 
				this.checkChildren( node , newItem );	
			}	
		}
	}
	
	this.empty = function () {
		this.items = new Object();
	}
	
	
	this.addToCart = function ( e ) {
		if(!e){
			var e = window.event;
		}
		var caller = e.target ? e.target : e.srcElement;
		simpleCart.Shelf.items[caller.id].addToCart();
	}
	
	
}

/********************************************************************************************************
 *			Shelf Item Object
 ********************************************************************************************************/


function ShelfItem(){
	
	this.id = "s" + NextId++;
	
	this.remove = function () {
		simpleCart.Shelf.items[this.id] = null;
	}
	
	
	this.addToCart = function () {
		var outStrings = new Array();
		for( var field in this ){
			if( typeof( this[field] ) != "function" && field != "id" ){
				var valueString = "";
				
				switch(field){
					case "price":
						if( this[field].value ){
							var valueString = this[field].value; 
						} else if( this[field].innerHTML ) {
							var valueString = this[field].innerHTML;
						}
						/* remove all characters from price except digits and a period */
						valueString = valueString.replace( /[^(\d|\.)]*/gi , "" );
						valueString = valueString.replace( /,*/ , "" );
						break;
					case "image":
						valueString = this[field].src;
						break;
					default:
						if( this[field].value ){
							var valueString = this[field].value; 
						} else if( this[field].innerHTML ) {
							var valueString = this[field].innerHTML;
						} else if( this[field].src ){
							var valueString = this[field].src;
						} else {
							var valueString = this[field];
						}
						break;
				}
				outStrings.push( field + "=" + valueString );
			}
		}
		
		simpleCart.add( outStrings );
	}
	
}







/********************************************************************************************************
 * Thanks to Peter-Paul Koch for these cookie functions (http://www.quirksmode.org/js/cookies.html)
 ********************************************************************************************************/
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}


//*************************************************************************************************
/*
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/	
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};


/********************************************************************************************************
 * String Reverse function (thanks to shachi and bytemycode.com - 
		http://www.bytemycode.com/snippets/snippet/400 ) 
 ********************************************************************************************************/


String.prototype.reverse = function(){
	splitext = this.split("");
	revertext = splitext.reverse();
	reversed = revertext.join("");
	return reversed;
}


/********************************************************************************************************
 * error management 
 ********************************************************************************************************/

function error( string ) {
		console.log( "simpleCart(js) Error: " , string );
		//alert( "Error: " + string );
}


var simpleCart = new Cart();

window.onload = simpleCart.initialize;