#simpleCart(js)									  
	
No databases, no programming, no headaches. A simple javascript shopping 
cart that you can setup in minutes. It's lightweight, fast, 
simple to use, and completely customizable. All you need to know is basic HTML.


Copyright (c) 2012 Brett Wejrowski
Dual licensed under the MIT or GPL licenses.


##This is version 3

If you would like to use an older version, you can use a different branch or see them in the 
downloads area

v3.0.5 changelog
 - moved beforeCheckout event and form sending inside of .checkout() to keep dry
 - added price, shipping, tax formatting for paypal checkout
 - added .submit method to ELEMENT 
 - fixed mootools .get and .live bugs


## Quick Start

To get started, just add the simpleCart javascript file to your page, and set your PayPal checkout:

	<script src="simpleCart.js"></script>
	<script>
		simpleCart({
			checkout: { 
				type: "PayPal" , 
				email: "you@yours.com" 
			}
		});	
	</script>

If you want to change options, like the tax or currency, you can do that as well:

	simpleCart({
		checkout: { 
			type: "PayPal" , 
			email: "you@yours.com" 
		},
		tax: 		0.075,
		currency: 	"EUR"
	});
	
To sell items, you add them to your "Shelf" by simply adding a few classes to your html:


	<div class="simpleCart_shelfItem">
	    <h2 class="item_name"> Awesome T-shirt </h2>
	    <input type="text" value="1" class="item_Quantity">
	    <span class="item_price">$35.99</span>
		<a class="item_add" href="javascript:;"> Add to Cart </a>
	</div>
	
	
You can use almost any type of html tag, and set any values for the item you want by adding a class of "item_[attrname]". 
Here is a more complex item with options and images:

	<div class="simpleCart_shelfItem">
	    <img src="/images/item_thumb.jpg" class="item_thumb" />
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
	
	
Please check out our documentation to see all of the options simpleCart has available!


## Version 3 Documentation 
		 
A work in progress..... I'm putting it here until we
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


**For more information, please go to simplecartjs.com**								  
		
