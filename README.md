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
is needed as long as one of those libraries is included on the page
	
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

You can make items be available to your users by simple using class names in your html. For any Item you want to be available to be added to the cart, you make a container with a class name of `simpleCart_shelfItem`. Then add classes to tags inside of that container that have the general form `item_[name of field]` and simpleCart will use the value or innerHTML of that tag for the cart. For example, if you wanted to sell a T-shirt with 3 different sizes, you can do this:

    <div class="simpleCart_shelfItem">
    	<h2 class="item_name"> Awesome T-shirt </h2>
    	<select class="item_size">
        	<option value="Small"> Small </option>
        	<option value="Medium"> Medium </option>
        	<option value="Large"> Large </option>
    	</select>
    	<input type="text" value="1" class="item_Quantity">
    	<span class="item_price">$35.99</span>
    	<a class="item_add" href="javascript:;"> Add to Cart </a>
	</div>
	
Notice here that you can use a select to change options for the item when you add it to the cart. You can also use a text input to change the quantity (or any other field!). These classes will work with any tag, so feel free to use what works best for you. Finally, notice that a tag with the class `item_add` will have an event listener on its click. So when the contents of that tag are clicked, an item will be added to the cart with the values of each of the tags in the container with the `item_something` class.

####Some notes:
*You will want to always supply a quantity and price. Although the cart won't break if you don't, all the quantities and totals are created from it, so the cart will assign a price of $0 if there is none, and a quantity of 1 if no quantity is provided.
*If you are planning on checking out to googleCheckout or paypal, it is a good idea to use a name field
*If you use a link for the add to cart button, its a good idea to set the href to `"javascript:;"`

##Cart Columns

The Cart Columns allow the user to specify how the cart will be formatted and displayed. There is a lot of flexibility here, take a look at the default setup:

    simpleCart({
		cartColumns: [
			{ attr: "name" , label: "Name" } ,
			{ attr: "price" , label: "Price", view: 'currency' } ,
			{ view: "decrement" , label: false , text: "-" } ,
			{ attr: "quantity" , label: "Qty" } ,
			{ view: "increment" , label: false , text: "+" } ,
			{ attr: "total" , label: "SubTotal", view: 'currency' } ,
			{ view: "remove" , text: "Remove" , label: false }
		]
    });

Each column is represented by an object, the most basic setup simple specifies which attribute to display and how to label the column: 

    { attr: "name" , label: "Name" }

There are also some built in 'views' that will create a special column.  For example, an 'increment' view: 

    { view: "increment" , label: false , text: "+" }

will have a link that increments the quantity. Setting the `label:false` will hide the label for the view. You can specify the text of the link with that `text:` attribute.

You can add `view: "currency"` to format the column as currency (see the currency section on more information on currency formatting). 

There are a number of built-in views, and you can create your own.  Here are what is already available:

###Attribute 

This is the basic view that displays an attribute of the item, and looks like 

    { attr: "name" , label: "Name" }

will output 

`<div class="item-name">Awesome T-Shirt</div>`

This will simply display the attribute value and set the header label. Notice you do not need to specify the `view` in the object: this is the default view

###Currency 

This view is exactly like the attribute view, except that it will format the attribute value as currency: 

    { attr: "price" , label: "Price", view: 'currency' }

`<div class="item-price">$139.86</div>`

###Decrement

This view will output a link that will decrement the quantity of the item:

    {view:'decrement', label: false }

`<div class="item-decrement "><a href="javascript:;" class="simpleCart_decrement">-</a></div>`

Optionally, you can set the `text` attribute which will set the innerHTML of the link (default is '-'):

    {view:'decrement' , label: false, text: 'Less' }

`<div class="item-decrement "><a href="javascript:;" class="simpleCart_decrement">Less</a></div>`


###Increment

This view will output a link that will increment the quantity of the item:

    {view:'increment', label: false }

`<div class="item-increment "><a href="javascript:;" class="simpleCart_increment">+</a></div>`

Optionally, you can set the `text` attribute which will set the innerHTML of the link (default is '+'):

    {view:'increment' , label: false, text: 'More' }

`<div class="item-increment "><a href="javascript:;" class="simpleCart_increment">More</a></div>`

###Remove

This view will output a link that will remove the item from the cart when clicked:

    {view:'remove', label: 'Remove' }

`<div class="item-remove "><a href="javascript:;" class="simpleCart_remove">X</a></div>`

Optionally, you can set the `text` attribute which will set the innerHTML of the link (default is 'X'):

    {view:'remove' , label: 'Remove', text: 'Remove' }

`<div class="item-remove "><a href="javascript:;" class="simpleCart_remove">Remove</a></div>`

###Link

This view will output a link, using the attribute provided as the href, and the `text` value as the innerHTML:

    {view:'link' , label: 'Details' , attr: 'pageLink' , text: 'View More' }

`<div class="item-pageLink"><a href="[value-of-pageLink-attr]">View More</a></div>`

###Image

This view will output an image, using the attribute specified as the source:

    {view:'image' , attr:'thumb', label: false}

`<div class="item-thumb "><img src='[value-of-thumb-attr]' /></div>`

###Input

This view will create an input, with the value set to the attribute provided.  When the user alters the input text, simpleCart(js) will input the item attribute.  This example makes the quantity an input that the user can alter:

    {view:'input', attr:'quantity', label: "Quantity" }

`<div class="item-quantity"><input type="text" value="[item-quantity]" class="simpleCart_input"/></div>`

###Creating your own view

You can create custom views for the cart by setting the `view` to a function instead of a string.  The function should take two arguments, the item for that row, and the column details you specify.

    { view: function( item , column ){
			// return some html
	  } ,
	  label: "My Custom Column"	
	}
	
As an example, let's say you wanted to have one column that displayed the total quantity, along with the links for incrementing and decrementing the quantity:

    { view: function(item, column){
        return  "<span>"+ item.quantity() +"</span>" + 
                "<div>" +
                    "<a href='javascript:;' class='simpleCart_increment'>+</a>" +
                    "<a href='javascript:;' class='simpleCart_decrement'>-</a>" +
                "</div>";
      } , 
      attr: "custom" ,
      label: "Quantity"
    },



##Checkout Methods

There are 4 built-in checkout methods that are included in simpleCart(js):
* Paypal 
* Google Checkout
* Amazon Payments
* Send Form

You can also create your own custom checkout or use an extension for prebuilt checkouts.  

###Paypal

In order to use PayPal Standard checkout, you can set the options like this:

    simpleCart({
		checkout: { 
			type: "PayPal" , 
			email: "you@yours.com" 
		} 
    });

There are additional optional parameters that can be set as well:

    simpleCart({
		checkout: { 
			type: "PayPal" , 
			email: "you@yours.com" ,
			
			// use paypal sandbox, default is false
			sandbox: true , 
			
			// http method for form, "POST" or "GET", default is "POST"
			method: "GET" , 
			
			// url to return to on successful checkout, default is null
			success: "success.html" , 
			
			// url to return to on cancelled checkout, default is null
			cancel: "cancel.html" 
		} 
    });


###Google Checkout

In order to use Google Checkout, you can set the options like this:

    simpleCart({
		checkout: { 
			type: "GoogleCheckout" , 
			marchantID: "XXXXXXXXX" ,
			
			// http method for form, "POST" or "GET", default is "POST"
			method: "GET" 
		} 
    });

**Google Checkout only accepts USD and GBP as currency**


###Amazon Payments
*Amazon Payments checkout is very lightly tested, please report any issues when testing*

To use Amazon Payments, you can setup the cart with these options:

    simpleCart({
		checkout: { 
			type: "AmazonPayments" , 
			merchant_signature: "XXXXXXXXX" ,
			merchant_id: "XXX",
			aws_access_key_id: "XXX" ,
			
			// optional parameters
			// http method for form, "POST" or "GET", default is "POST"
			method: "GET" ,
			
			// use sandbox server, default is false
			sandbox: true ,
			
			// optional weight unit for calculating shipping, default is "lb"
			weight_unit: "lb" 
		} 
    });


###Send Form



##Events

simpleCart(js) has lots of events that allow you to customize and modify the core functionality.  You can add a callback to an event by using the `simpleCart.bind()` event:

    simpleCart.bind( 'afterAdd' , function( item ){
		alert( item.name + " has been added to the cart!");
    });

There are several built in events that you can tie in to:

###beforeAdd

###afterAdd
	
###load

###beforeSave

###afterSave

###update

###ready

###checkoutSuccess

###checkoutFail

###beforeCheckout

###Custom events

You can trigger custom simpleCart(js) events using the `.trigger()` function:

    simpleCart.trigger( 'awesomeEvent' );

You can optionally send arguments to a triggered event by passing an array of values to `.trigger()`:

    simpleCart.trigger( 'awesomeEvent' , [ myfirstarg, mysecondarg ] );


##Currency

simpleCart(js) has a number of currencies that are already supported out of the box.  You can specify the currency a number of ways, such as setting the option:

    simpleCart({
		currency: "GBP" // set the currency to pounds sterling
    });

You can also set the currency using the `.currency()` function:

    simpleCart.currency( "EUR" ); // set the currency to Euros

The built-in currencies are listed below, but you can also set a new currency using the `.currency()` function:

	simpleCart.currency({ 
		code: "MAC" ,
		name: "My Awesome Currency" ,
		symbol: "$@" 
	});
	
There are a number of formatting options when setting a currency as well.  For example, if you wanted your currency to be formatted as `123 456,780 $AWE` instead of `$123,456.78`, you would use:

	simpleCart.currency({
		code: "MAC" ,
		name: "My Awesome Currency" ,
		symbol: " $AWE" ,
		delimiter: " " , 
		decimal: "," , 
		after: true ,
		accuracy: 3
	});
	
If you would like to see what the currency is currently set to, you can call the `.currency()` function with no arguments:

	simpleCart.currency("USD");

    simpleCart.currency();  // returns { code:"USD", symbol:"&#36;", name:"US Dollar" } 

Built-in currencies:

    "USD": { code:"USD", symbol:"&#36;", name:"US Dollar" } , 
    "AUD": { code:"AUD", symbol:"&#36;", name:"Australian Dollar" } , 
    "BRL": { code:"BRL", symbol:"&#36;", name:"Brazilian Real" } , 
    "CAD": { code:"CAD", symbol:"&#36;", name:"Canadian Dollar" } , 
    "CZK": { code:"CZK", symbol:"&nbsp;&#75;&#269;", name:"Czech Koruna", after: true } , 
    "DKK": { code:"DKK", symbol:"DKK&nbsp;", name:"Danish Krone" } , 
    "EUR": { code:"EUR", symbol:"&euro;", name:"Euro" } , 
    "HKD": { code:"HKD", symbol:"&#36;", name:"Hong Kong Dollar" } ,
    "HUF": { code:"HUF", symbol:"&#70;&#116;", name:"Hungarian Forint" } ,
    "ILS": { code:"ILS", symbol:"&#8362;", name:"Israeli New Sheqel" } ,
    "JPY": { code:"JPY", symbol:"&yen;", name:"Japanese Yen" } ,
    "MXN": { code:"MXN", symbol:"&#36;", name:"Mexican Peso" } ,
    "NOK": { code:"NOK", symbol:"NOK&nbsp;", name:"Norwegian Krone" } ,
    "NZD": { code:"NZD", symbol:"&#36;", name:"New Zealand Dollar" } ,
    "PLN": { code:"PLN", symbol:"PLN&nbsp;", name:"Polish Zloty" } ,
    "GBP": { code:"GBP", symbol:"&pound;", name:"Pound Sterling" } ,
    "SGD": { code:"SGD", symbol:"&#36;", name:"Singapore Dollar" } ,
    "SEK": { code:"SEK", symbol:"SEK&nbsp;", name:"Swedish Krona" } ,
    "CHF": { code:"CHF", symbol:"CHF&nbsp;", name:"Swiss Franc" } ,
    "THB": { code:"THB", symbol:"&#3647;", name:"Thai Baht" }

**If there are errors or problems with the default formatting of your currency, please let us know so we can update the base code**


##Shipping

		
**For more information, please go to simplecartjs.com**								  
		
		