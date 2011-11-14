#simpleCart(js)									  
	
No databases, no programming, no headaches. A simple javascript shopping 
cart in under 8kb that you can setup in minutes. It's lightweight, fast, 
simple to use, and completely customizable. All you need to know is basic HTML.


Copyright (c) 2011 Brett Wejrowski
Dual licensed under the MIT or GPL licenses.
		 
Version 3 Documentation - A work in progress..... I'm putting it here until we
have the new site up so I can put it...well.. there. 
	
	
##simpleCart(js) Setup/Initialization
	
simpleCart(js) _requires using jQuery, Prototype, or Mootools_. No extra configuration 
is needed as long as one of those libaries is included on the page
	
You can set/change simpleCart options at any time:
	
	simpleCart({
		option1: "value" ,
		option2: "value2" 
	});
		
	
Here are the possible options and their default values: 

	simpleCart({
		
		// array representing the format and columns of the cart, see 
		// the cart columns documentation
		cartColumns: [
			{ attr: "name" , label: "Name" },
			{ attr: "price" , label: "Price", view: 'currency' },
			{ view: "decrement" , label: false },
			{ attr: "quantity" , label: "Qty" },
			{ view: "increment" , label: false },
			{ attr: "total" , label: "SubTotal", view: 'currency' },
			{ view: "remove" , text: "Remove" , label: false }
		],
		
		// "div" or "table" - builds the cart as a table or collection of divs
		cartStyle: "div", 
		
		// how simpleCart should checkout, see the checkout reference for more info 
		checkout: { 
			type: "PayPal" , 
			email: "you@yours.com" 
		},
		
		// set the currency, see the currency reference for more info
		currency: "USD",
		
		// collection of arbitrary data you may want to store with the cart, 
		// such as customer info
		data: {},
		
		// set the cart langauge (may be used for checkout)
		language: "english-us",
		
		// array of item fields that will not be sent to checkout
		excludeFromCheckout: [],
		
		// custom function to add shipping cost
		shippingCustom: null,
		
		// flat rate shipping option
		shippingFlatRate: 0,
		
		// added shipping based on this value multiplied by the cart quantity
		shippingQuantityRate: 0,
		
		// added shipping based on this value multiplied by the cart subtotal
		shippingTotalRate: 0,
		
		// tax rate applied to cart subtotal
		taxRate: 0,
		
		// true if tax should be applied to shipping
		taxShipping: false,
		
		// event callbacks 
		beforeAdd				: null,
		afterAdd				: null,
		load					: null,
		beforeSave				: null,
		afterSave				: null,
		update					: null,
		ready					: null,
		checkoutSuccess				: null,
		checkoutFail				: null,
		beforeCheckout				: null
	});


	
##The Shelf

##Cart Columns

##Checkout Methods
* Paypal 
* Google Checkout
* Amazon Payments
* Send Form
* Custom

##Events

##Currency

##Shipping

##Function Reference

simpleCart.$( selector )
####arguments 
*selector: string of a css selector

####returns:
*simpleCart.ELEMENT object containing one or more dom elements if the selector matches anything on the page

Before:
	<ul>
		<li class="item">Item 1</li>
		<li class="item">Item 2</li>
		<li class="item">Item 3</li>
	</ul>

	
	var items = simpleCart.$('li.item');
	items.addClass('cool');


After:
	<ul>
		<li class="item cool">Item 1</li>
		<li class="item cool">Item 2</li>
		<li class="item cool">Item 3</li>
	</ul>



###simpleCart.$create( tag )
####arguments
*tag: string of tagName of DOM element to create (ie 'span','div', etc)

####returns:
*simpleCart.ELEMENT object of new DOM element

	<div id="container">
	</div>


	var myDiv = simpleCart.$create('div');
	myDiv.text("hello");
	simpleCart.$("#container").append(myDiv);

	<div id="container">
		<div>hello</div>
	<div id="container">


###simpleCart.add( values )
####arguments
*values: name/value map of an item to be added to the cart

####returns: 
*simpleCart.Item object if successfully added

	simpleCart.add({ 
		name: "Cool T-Shirt" ,
		price: 45.99 ,
		size: "Small" ,
		quantity: 3
	});

If a price is not supplied, it is set to 0.

If a quantity is not supplied, it is set to 1.

If all of the fields match an item currently in the cart, simpleCart
will increment that items quantity by the quantity supplied

###simpleCart.bind( eventname , callback )
####arguments
*eventname: string representing the name of an event
*callback: function that will be called when the event is fired

####returns: 
*simpleCart

	simpleCart.bind( 'error' , function(message){
		alert( message );
	});


When an error event is triggered, the function will be called and the 
error message will be alerted.

Please view the Event reference for existing event names and arguments supplied.



###simpleCart.bindInputs( inputs )



###simpleCart.bindOutlets( outlets )


###simpleCart.bindReady()

used internally to bind the simpleCart init to DOM ready

###simpleCart.checkout()

Send simpleCart to checkout

###simpleCart.checkout.AmazonPayments( options )

####arguments 
*options: object of option values

Checkout to AmazonPayments, called from simpleCart.checkout() if 
AmazonPayments is set up as the checkout gateway


###simpleCart.checkout.GoogleCheckout( options )

####arguments 
*options: object of option values

Checkout to GoogleCheckout, called from simpleCart.checkout() if 
GoogleCheckout is set up as the checkout gateway

###simpleCart.checkout.PayPal( options )

####arguments 
*options: object of option values

Checkout to PayPal, called from simpleCart.checkout() if 
AmazonPayments is set up as the checkout gateway

###simpleCart.checkout.SendForm( options )

####arguments 
*options: object of option values

Checkout to a Url by submitting a form, called from simpleCart.checkout() if 
SendForm checkout method is set up as the checkout gateway


###simpleCart.chunk( str , chunk_size )
####arguments
*string: string to be broken up
*chunk_size: max size of chunk 

####returns: 
*array of strings, each which a max length of chunk_size


###simpleCart.createCartRow()

used internally by simpleCart to generate a row in the cart html		


###simpleCart.copy( namespace )
####arguments:
*namespace (string)

####returns:
*new simpleCart object with the given namespace 

this function creates and returns a new instance of simpleCart, using
the given namespace for storage and classes.  This makes it possible 
to have multiple carts on one page


###simpleCart.currency( [currency_object] )
####arguments:
*currency_object (optional):
*string: sets the currency using the code provided
*object: sets the currency using the currency object (see currency section for reference)

####returns:
*if no argument is provided, it returns the current currency being used




###simpleCart.each( [array ,] callback )
####arguments:
*array (optional): array or object to iterate through.  If it is not provided, simpleCart will iterate through the objects in the cart
*callback: function to call with each iteration

Iterating through the simpleCart objects:

	simpleCart.add({name: "Sticker",price: 1});
	simpleCArt.add({name: "Button",price: 1});

	var items = [];

	simpleCart.each(function( item , x ){
		items.push( item.name );
	});

	console.log( items );   // [ "Sticker" , "Button" ]



###simpleCart.ELEMENT
###simpleCart.ELEMENT._
###simpleCart.ELEMENT.text( [text] )
###simpleCart.ELEMENT.html( [html] )
###simpleCart.ELEMENT.val( [value] )
###simpleCart.ELEMENT.attr( attr [, value] )
###simpleCart.ELEMENT.remove()
###simpleCart.ELEMENT.addClass( class )
###simpleCart.ELEMENT.removeClass( class )
###simpleCart.ELEMENT.append( item )
###simpleCart.ELEMENT.each( callback )
###simpleCart.ELEMENT.click( [callback] )
###simpleCart.ELEMENT.live( event, callback )
###simpleCart.ELEMENT.match( selector )
###simpleCart.ELEMENT.parent()
###simpleCart.ELEMENT.find( selector )
###simpleCart.ELEMENT.closest( selector )
###simpleCart.ELEMENT.descendants()
###simpleCart.ELEMENT.tag()
###simpleCart.ELEMENT.create( selector )
###simpleCart.empty()
###simpleCart.error( message )
###simpleCart.extend( [target ,] options )
###simpleCart.extendCheckout( methods )
###simpleCart.find( criteria )
###simpleCart.grandTotal()
###simpleCart.has( item )
###simpleCart.ids()
###simpleCart.init()
###simpleCart.isReady	
###simpleCart.Item
###simpleCart.Item._
###simpleCart.Item.increment( [amount] )
###simpleCart.Item.decrement( [amount] )
###simpleCart.Item.remove()
###simpleCart.Item.reservedFields()
###simpleCart.Item.fields()
###simpleCart.Item.quantity( [value] )
###simpleCart.Item.price( [value] )
###simpleCart.Item.id()
###simpleCart.Item.total()
###simpleCart.load()
###simpleCart.quantity()
###simpleCart.ready( [function] )
###simpleCart.save()
###simpleCart.setInput( selector , event , func )
###simpleCart.setOutlet( selector , function )
###simpleCart.setupViewTool()
###simpleCart.shipping( [custom_function] )
###simpleCart.tax()
###simpleCart.taxRate()
###simpleCart.toCurrency( number [, options] )
###simpleCart.total()
###simpleCart.trigger( eventname)
###simpleCart.update()
###simpleCart.writeCart()	



##Plugins
	
		
**For more information, please go to simplecartjs.com**								  
		
		