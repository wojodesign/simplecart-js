/****************************************************************************
Copyright (c) 2011 The Wojo Group

thewojogroup.com
simplecartjs.com
http://github.com/wojodesign/simplecart-js/tree/master

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/

(function(window,undefined){
	
	
var	typeof_string			= typeof "",
	typeof_undefined		= typeof undefined,
	typeof_function			= typeof function(){},
	typeof_object			= typeof {},
	isTypeOf				= function( item , type ){ return typeof item === type },
	isString				= function( item ){ return isTypeOf( item , typeof_string ); },
	isUndefined				= function( item ){ return isTypeOf( item , typeof_undefined ); },
	isFunction				= function( item ){ return isTypeOf( item , typeof_function ); },
	
	isObject				= function( item ){ return isTypeOf( item , typeof_object ); },
	//Returns true if it is a DOM element    
	isElement				= function(o){
	 	return (
	    	typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    	typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	},
	
	
	
generateSimpleCart = function(space){	

	// stealing this from selectivizr
	var selectorEngines = {
		"MooTools"							: "$$",
		"Prototype"							: "$$",
		"jQuery"							: "*"
	},
	
	
	// local variables for internal use
	item_id 				= 1,
	item_id_namespace		= "SCI-",
	shelfitem_id			= 1,
	shelfitem_id_namespace 	= "SCS-",
	sc_items 				= {},
	namespace 				= space || "simpleCart",
	
	
	// Currencies
	currencies = {
		  "USD": { code:"USD", symbol:"$", name:"US Dollar" }
		, "AUD": { code:"AUD", symbol:"$", name:"Australian Dollar" }
	},
	
	// default options
	settings = {
		  checkout				: { type: "PayPal" , email: "brett@wojodesign.com" } 
		, currency				: "USD"
		, language				: "english-us"
		, cookieDuration		: 30 
				
		, cartStyle				: "table"
		, cartColumns			: [
			  { attr: "name" , label: "Name" }
			, { attr: "price" , label: "Price", view: 'currency' }
			, { view: "decrement" , label: false }
			, { attr: "quantity" , label: "Qty" }
			, { view: "increment" , label: false }
			, { attr: "total" , label: "SubTotal", view: 'currency' }
			, { view: "remove" , text: "Remove" , label: false }
		]
		
		, excludeFromCheckout	: [ 'thumb' ]
		
		, shippingFlatRate		: 0
		, shippingQuantityRate	: 0
		, shippingTotalRate		: 0
		, shippingCustom		: null
		
		, taxRate				: [ 0.06 ]
		
		, cartInfo				: {}
		
		
	}, 
	
	
	// main simpleCart object, function call is used for setting options
 	simpleCart = function( options ){
		// shortcut for simpleCart.ready
		if( isFunction( options ) ){
			return simpleCart.ready( options );
		} 
		
		// set options
		else if( isObject( options ) ){
			return simpleCart.extend( settings , options );
		}
	};
	

	// function for extending objects
	simpleCart.extend = function( target , opts ){
		
		if( isUndefined( opts ) ){
			opts = target;
			target = simpleCart;
		}
		
		for( var next in opts ){
			target[ next ] = opts[ next ];
		}
		return target;
	};
	
	// create copy function
	simpleCart.extend({
		copy: function(n){
			var cp = generateSimpleCart(n);
			cp.init();
			return cp;
		}
	});
		
	// add in the core functionality 	
	simpleCart.extend({
		
		isReady: false,
		
		// this is where the magic happens, the add function
		add: function( values ){
			var info 		= values || {},
				newItem 	= new simpleCart.Item( info ),
				oldItem;
				
			// trigger before add event
			simpleCart.trigger('beforeAdd' , [ newItem ] );
			
			// if the new item already exists, increment the value
			if( oldItem = simpleCart.has( newItem ) ){
				oldItem.increment( newItem.quantity() );
				newItem = oldItem;
			}
			// otherwise add the item
			else { 
				sc_items[ newItem.id() ] = newItem ;
			}
			
			// update the cart 
			simpleCart.update();
			
			// trigger after add event
			simpleCart.trigger( 'afterAdd' , [ newItem , isUndefined( oldItem ) ] );
			
			// return a reference to the added item
			return newItem;
		},
		
		
		// iteration function 
		each: function( array , callback ){
			var next,
				x=0, 
				result;

			if( isFunction( array ) ){
				var cb = array,
					items = sc_items;
			} else if( isFunction( callback ) ){
				var cb = callback,
					items = array;
			} else {
				return;
			}

			for( next in items ){
				if( !isFunction( items[next] ) ){
					result = cb.call( simpleCart , items[next] , x , next );
					if( result === false ){
						return;
					}
					x++;
				}
			}
		},
		
		find: function( id ){
			// TODO: bad ass finder
			return sc_items[id];
		},
		
		// check to see if item is in the cart already
		has: function( item ){
			var current, 
				matches,
				field,
				match=false;

			simpleCart.each(function(testItem){ 
				matches = true;
				if( testItem.equals( item ) ){
					match = testItem;
				}
			});
			return match;
		},
		
		// empty the cart
		empty: function(){
			sc_items = {};
			simpleCart.update();
		},
		
		
		// functions for accessing cart info
		quantity: function(){
			var quantity = 0;
			simpleCart.each(function(item){
				quantity+=item.quantity();
			});
			return quantity;
		},
		
		total: function(){
			var total = 0;
			simpleCart.each(function(item){
				total+=item.total();
			});
			return total;
		},
		
		
		// updating functions
		update: function(){
			simpleCart.save();
			simpleCart.trigger("update");
		},
		
		init: function(){
			simpleCart.load();
			simpleCart.update();
			simpleCart.ready();
		},
				
		// view management
		$: function( selector ){
			return new simpleCart.ELEMENT( simpleCart.$engine( selector ), selector );
		},
		
		$create: function( tag ){
			return simpleCart.$( document.createElement(tag) );
		},
		
		$engine: {},
		
		setupViewTool: function(){
			// Determine the "best fit" selector engine
			for (var engine in selectorEngines) {
				var members, member, context = window;
				if (window[engine]) {
					members = selectorEngines[engine].replace("*", engine).split(".");
					while ((member = members.shift()) && (context = context[member])) {}
					if (typeof context == "function") {
						// set the selector engine and extend the prototype of our 
						// element wrapper class
						simpleCart.$engine = context;
						simpleCart.extend( simpleCart.ELEMENT._ , selectorFunctions[ engine ] );
						return;
					}
				}
			}
		}, 
		
		
		// storage 
		save: function(){
			simpleCart.trigger('beforeSave');
			
			// TODO: save
			
			simpleCart.trigger('afterSave');
		}, 
		
		load: function(){
			
			// TODO: load
			
			simpleCart.trigger('load');
		},
		
		// ready function used as a shortcut for bind('ready',fn)
		ready: function(fn){
			
			if(isFunction( fn )){ 
				// call function if already ready already
				if( simpleCart.isReady ){
					fn.call(simpleCart);
				} 
				// bind if not ready
				else {
					simpleCart.bind( 'ready' , fn );
				}
			}
			
			// trigger ready event
			else if( isUndefined(fn) && !simpleCart.isReady ){
				simpleCart.trigger('ready');
				simpleCart.isReady = true;
			}
			
		},
		
		// bind ready event used from jquery
		bindReady: function() {

			// Catch cases where $(document).ready() is called after the
			// browser event has already occurred.
			if ( document.readyState === "complete" ) {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				return setTimeout( simpleCart.init, 1 );
			}

			// Mozilla, Opera and webkit nightlies currently support this event
			if ( document.addEventListener ) {
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", simpleCart.init, false );

			// If IE event model is used
			} else if ( document.attachEvent ) {
				// ensure firing before onload,
				// maybe late but safe also for iframes
				document.attachEvent( "onreadystatechange", DOMContentLoaded );

				// A fallback to window.onload, that will always work
				window.attachEvent( "onload", simpleCart.init );

				// If IE and not a frame
				// continually check to see if the document is ready
				var toplevel = false;

				try {
					toplevel = window.frameElement == null;
				} catch(e) {}

				if ( document.documentElement.doScroll && toplevel ) {
					doScrollCheck();
				}
			}
		},
		
		error: function(message){
			try{ console.log("simpleCart(js) Error: " + message ); } catch(e){}
		}
	});
	
	/*******************************************************************
	 * 	TAX AND SHIPPING
	 *******************************************************************/
	simpleCart.extend({
		
		// TODO: tax and shipping
		tax: function(){
			return 0;
		} ,
		shipping: function(){
			return 0;
		}
		
	});
	
	/*******************************************************************
	 * 	CART VIEWS
	 *******************************************************************/
	
	simpleCart.extend({		
		
		// write out cart
		writeCart: function(){
			var TABLE = settings.cartStyle,
				isTable = TABLE === 'table',
				TR = isTable ? "tr" : "div",
				TH = isTable ? 'th' : 'div',
				TD = isTable ? 'td' : 'div',
				cart_container = simpleCart.$create( TABLE ),
				header_container = simpleCart.$create( TR ).addClass('headerRow');
				
			// create header 
			for( var x=0,xlen = settings.cartColumns.length; x<xlen; x++ ){
				var column 	= cartColumn( settings.cartColumns[x] ),
					klass 	=  "item-" + (column.attr || column.view || column.label || column.text || "cell" ) + " " + column.className,
					label 	= column.label || "";
					
				// append the header cell
				header_container.append(
					simpleCart.$create( TH ).addClass( klass ).html( label )
				);
			}
			cart_container.append( header_container );
			
			// cycle through the items
			simpleCart.each( function( item, y ){
				cart_container.append( simpleCart.createCartRow( item , y , TR , TD ) );
			});
			
			return cart_container;
		},
		
		// generate a cart row from an item
		createCartRow: function( item , y , TR , TD ){
			var row = simpleCart.$create( TR )
								.addClass( 'itemRow row-' + y + " " + ( y%2 ? "even" : "odd" )  )
								.attr('id' , "cartItem_" + item.id() );
				
			// cycle through the columns to create each cell for the item
			for( var j=0,jlen=settings.cartColumns.length; j<jlen; j++ ){
				var column 	= cartColumn( settings.cartColumns[ j ] ),
					klass 	= "item-" + (column.attr || column.view || column.label || column.text || "cell" ) + " " + column.className,
					content = cartCellView( item , column ),
					cell 	= simpleCart.$create( TD ).addClass( klass ).html( content );
				
				row.append( cell );
			}
			return row;
		}
		
	});
	
	// cart column wrapper class and functions
	var	cartColumn = function( opts ){
		var options = opts || {};
		return simpleCart.extend({
				  attr			: "" 
				, label			: "" 
				, view			: "attr"
				, text			: ""
				, className		: ""
				, hide			: false
			}, options );
		} ,
		
		// built in cart views for item cells
		cartColumnViews = {
			  attr: function( item , column ){ 
				return item.get( column.attr ) || "";
			}
			, currency: function( item , column ){
				return simpleCart.toCurrency( item.get( column.attr ) || 0 );
			}
			, link: function( item , column ){
				return "<a href='" + item.get( column.attr ) + "'>" + column.text + "</a>";
			} 
			, decrement: function( item , column ){
				return "<a href='javascript:;' class='simpleCart_decrement'>" + ( column.text || "-" ) + "</a>";
			}
			, increment: function( item , column ){
				return "<a href='javascript:;' class='simpleCart_increment'>" + ( column.text || "+" ) + "</a>";
			}
			, image: function( item , column ){
				return "<img src='" + item.get( column.attr ) + "'/>"
			}
			, input: function( item , column ){
				return "<input type='text' value='" + item.get( column.attr ) + "' class='simpleCart_input'/>";
			} 
			, remove: function( item , column ){
				return "<a href='javascript:;' class='simpleCart_remove'>" + ( column.text || "X" ) + "</a>";
			}
		} ,
		
		cartCellView = function( item , column ){
			var viewFunc =  isFunction( column.view ) ? column.view :
							isString( column.view ) && isFunction( cartColumnViews[ column.view ] ) ? cartColumnViews[ column.view ] :
							cartColumnViews['attr'];
							
			return viewFunc.call( simpleCart , item , column );
		},
	
	
	
		/*******************************************************************
		 * 	CART ITEM CLASS MANAGEMENT
		 *******************************************************************/
		
 	 	Item = simpleCart.Item = function( info ){
		
			// we use the data object to track values for the item
			var _data = {},
				me = this;
			
			// cycle through given attributes and set them to the data object
			if( isObject( info ) ){
				simpleCart.extend( _data , info );	
			}
			
			// set the item id
			_data.id = _data.id || item_id_namespace + (++item_id); 
			while( !isUndefined( sc_items[_data.id] ) ){
				_data.id = item_id_namespace + (++item_id); 
			}
			
			function checkQuantityAndPrice(){
				
				// check to make sure price is valid
				if( isString(_data.price ) ){
					_data.price = parseFloat( _data.price.replace(simpleCart.currency().symbol,"").replace(simpleCart.currency().delimiter,"") );
				}
				if( isNaN( _data.price ) ){
					_data.price = 0;
				}
				if( _data.price < 0 ){
					_data.price = 0;
				}
				
				// check to make sure quantity is valid
				if( isString( _data.quantity ) ){
					_data.quantity = parseInt( _data.quantity.replace(simpleCart.currency().delimiter,"") );
				}
				if( isNaN( _data.quantity ) ){
					_data.quantity = 1;
				}
				if( _data.quantity <= 0 ){
					me.remove();
				}
			
			}
		
			// getter and setter methods to access private variables
			me.get = function( name , skipPrototypes ){
			
				usePrototypes = !skipPrototypes;
			
				if( isUndefined( name ) ){
					return name;
				}
			
				// return the value in order of the data object and then the prototype 	
				return 	isFunction( _data[name] ) 	? _data[name].call(me) : 
						!isUndefined( _data[name] ) ? _data[name] :
					
						isFunction( me[name] ) && usePrototypes		? me[name].call(me) :
						!isUndefined( me[name] ) && usePrototypes	? me[name] :
						_data[name];
			};
			me.set = function( name , value ){
				if( !isUndefined( name ) ){
					_data[name.toLowerCase()] = value;
					if( name.toLowerCase() === 'price' || name.toLowerCase() === 'quantity' ){
						checkQuantityAndPrice();
					}
				}
				return me;
			};
			me.equals = function( item ){
				var matches = true;
				simpleCart.each(_data,function(val,x,label){
					if( label !== 'quantity' && label !== 'id' ){
						if( item.get(label) != val ){
							return matches = false;
						}
					}
				});
				return matches;
			};
			me.options = function(){
				var data = {};
				simpleCart.each(_data,function(val,x,label){
					if( label !== 'quantity' && 
						label !== 'id' && 
						label !== 'item_number' && 
						label !== 'price' && 
						label !== 'name' &&
						label !== 'shipping' ){
						data[label] = me.get(label);
					}
				});
				return data;
			};
			
			
			checkQuantityAndPrice();
		};
	
	Item._ = Item.prototype = {
		
		// editing the item quantity
		increment: function( amount ){
			var diff = amount || 1;
			diff = parseInt( diff , 10);
			
			this.quantity( this.quantity() + diff );
			if( this.quantity() < 1 ){
				this.remove();
				return null;
			}
			return this;

		},
		decrement: function( amount ){
			var diff = amount || 1;
			return this.increment( -parseInt( diff , 10 ) );
		},
		remove: function(){
			delete sc_items[this.id()];
			simpleCart.update();
			return null;
		},
		
		
		
		// shortcuts for getter/setters. can
		// be overwritten for customization
		quantity: function( val ){
			return isUndefined( val ) ? parseInt( this.get("quantity",true) || 1 , 10 ) : this.set("quantity", val );
		},
		price: function( val ){
			return isUndefined( val ) ? 
					parseFloat( (""+this.get("price",true)).replace(simpleCart.currency().symbol,"").replace(simpleCart.currency().delimiter,"") || 1 ) : 
					this.set("price", parseFloat( (""+val).replace(simpleCart.currency().symbol,"").replace(simpleCart.currency().delimiter,"") ) ) ;
		},
		id: function(){
			return this.get( 'id',false );
		},
		total:function(){
			return this.quantity()*this.price();
		}
		
	};
	
	
	

	/*******************************************************************
	 * 	CHECKOUT MANAGEMENT
	 *******************************************************************/
	
	var checkoutMethods = {
		PayPal: function(opts){
			// account email is required
			if( !opts.email ){
				return simpleCart.error("No email provided for PayPal checkout");
			}
			
			// build basic form options
			var data = {
					  cmd			: "_cart"
					, upload		: "1"
					, currency_code	: simpleCart.currency().code
					, business		: opts.email
					, rm			: opts.method === "GET" ? "0" : "2"
					, tax_cart		: simpleCart.tax()
					, handling_cart : simpleCart.shipping()
				},
				action = opts.sandbox ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr",
				method = opts.method === "GET" ? "GET" : "POST";
	
			
			// check for return and success URLs in the options
			if( opts.success ){
				data['return'] = opts.success;
			}
			if( opts.cancel ){
				data['cancel_return'] = opts.cancel;
			}
			
			
			// add all the items to the form data
			simpleCart.each(function(item,x){
				var counter = x+1,
					item_options = item.options(),
					optionCount = 0;
					
				// basic item data
				data["item_name_" + counter ] = item.get("name");
				data["quantity_" + counter ] = item.quantity();
				data["amount_" + counter] = item.price();
				data["item_number_" + counter ] = item.get("item_number") || counter;
				
				// add the options
				simpleCart.each( item_options , function(val,k,attr){
					// paypal limits us to 10 options 
					if( k < 10 ){
						
						// check to see if we need to exclude this from checkout
						var send = true
						simpleCart.each( settings.excludeFromCheckout , function(field_name){
							if( field_name == attr ){ send = false; }
						});
						if( send ){
								optionCount++;
								data["on" + k + "_" + counter ] = attr;
								data["os" + k + "_" + counter ] = val;
						}
					
					}
				});
				
				// options count
				data["option_index_"+ x ] = Math.min( 10 , optionCount );
			});
			
			generateAndSendForm({
				  action	: action
				, method	: method
				, data		: data
			});
		} ,
		
		
		GoogleCheckout: function(opts){
			// account id is required
			if( !opts.merchantID ){
				return simpleCart.error("No merchant id provided for GoogleCheckout");
			}
			
			// google only accepts USD and GBP
			if( simpleCart.currency().code !== "USD" && simpleCart.currency().code !== "GBP"){
				return simpleCart.error("Google Checkout only accepts USD and GBP");
			}
			
			// build basic form options
			var data = {
					// TODO: better shipping support for this google
					  ship_method_name_1	: "Shipping"
					, ship_method_price_1	: simpleCart.shipping()
					, ship_method_currency_1: simpleCart.currency().code
					, _charset_				: ''
				},
				action = "https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/" + opts.merchantID,
				method = opts.method === "GET" ? "GET" : "POST";
	
			
			// add items to data
			simpleCart.each(function(item,x){
				var counter = x+1,
					options_list = [];
				data['item_name_' + counter ] 		= item.get('name');
				data['item_quantity_' + counter ] 	= item.quantity();
				data['item_price_' + counter ] 		= item.price();
				data['item_currency_ ' + counter ] 	= simpleCart.currency().code
				data['item_tax_rate' + counter ]	= item.get('taxRate') || simpleCart.taxRate();
				
				// create array of extra options
				simpleCart.each( item.options() , function(val,x,attr){
					// check to see if we need to exclude this from checkout
					var send = true
					simpleCart.each( settings.excludeFromCheckout , function(field_name){
						if( field_name == attr ){ send = false; }
					});
					if( send ){
						options_list.push( attr + ": " + val );
					}
				});
				
				// add the options to the description
				data['item_description_' + counter ] = options_list.join(", ");
			});
			
			generateAndSendForm({
				  action	: action
				, method	: method
				, data		: data
			});
			
		} ,
		
		
		SendForm: function(opts){
			// url required
			if( !opts.url ){
				return simpleCart.error('URL required for SendForm Checkout');
			}
			
			// build basic form options
			var data = {
					  currency	: simpleCart.shipping()
					, shipping	: simpleCart.currency().code
					, tax		: simpleCart.tax()
				},
				action = opts.url
				method = opts.method === "GET" ? "GET" : "POST";
	
			
			// add items to data
			simpleCart.each(function(item,x){
				var counter = x+1,
					options_list = [];
				data['item_name_' + counter ] 		= item.get('name');
				data['item_quantity_' + counter ] 	= item.quantity();
				data['item_price_' + counter ] 		= item.price();
				
				// create array of extra options
				simpleCart.each( item.options() , function(val,x,attr){
					// check to see if we need to exclude this from checkout
					var send = true
					simpleCart.each( settings.excludeFromCheckout , function(field_name){
						if( field_name == attr ){ send = false; }
					});
					if( send ){
						options_list.push( attr + ": " + val );
					}
				});
				
				// add the options to the description
				data['item_options_' + counter ] = options_list.join(", ");
			});
			
			
		
			// check for return and success URLs in the options
			if( opts.success ){
				data['return'] = opts.success;
			}
			if( opts.cancel ){
				data['cancel_return'] = opts.cancel;
			}

			
			generateAndSendForm({
				  action	: action
				, method	: method
				, data		: data
			});
			
		} ,
		
		
	} , 
	
	generateAndSendForm = function(opts){
		var form = simpleCart.$create("form");
		form.attr('style' , 'display:none;' );
		form.attr('action', opts.action );
		form.attr('method', opts.method );
		simpleCart.each(opts.data, function(val , x , name ){
			form.append( 
				simpleCart.$create("input").attr("type","hidden").attr("name",name).val(val)
			);
		});
		simpleCart.$("body").append(form);
		form.el.submit();
		form.remove();
	};
	
	
	simpleCart.extend({
		checkout: function(){
			if( settings.checkout.type.toLowerCase() === 'custom' && isFunction(settings.checkout.fn) ){
				settings.checkout.fn.call(simpleCart,settings.checkout)
			} else if( isFunction( simpleCart.checkout[settings.checkout.type] ) ){
				simpleCart.checkout[settings.checkout.type].call(simpleCart,settings.checkout);
			} else {
				simpleCart.error("No Valid Checkout Method Specified");
			}
		} ,
		extendCheckout: function( methods ){
			return simpleCart.extend( simpleCart.checkout, checkoutMethods );
		}
	});
	
	simpleCart.extendCheckout( checkoutMethods );
	
	
	
	/*******************************************************************
	 * 	EVENT MANAGEMENT
	 *******************************************************************/
	var eventFunctions = {

		// bind a callback to an event
		bind: function( name , callback ){
			if( !isFunction( callback ) ){
				return this;
			}
			
			if( !this._events ){
				this._events = {};
			}

			if (this._events[name] === true ){
				callback.apply( this );
			} else if( !isUndefined( this._events[name] ) ){
				this._events[name].push( callback );
			} else {
				this._events[name] = [ callback ];
			}
			return this;
		},

		// trigger event
		trigger: function( name , options ){
			var returnval = true;
			if( !this._events ){
				this._events = {};
			}
			if( !isUndefined( this._events[name] ) && isFunction( this._events[name][0] ) ){
				for( var x=0,xlen=this._events[name].length; x<xlen; x++ ){
					returnval = this._events[name][x].apply( this , (options ? options : [] ) );
				}
			}
			if( returnval === false ){
				return false;
			} else {
				return true;
			}
		}
		
	};
	simpleCart.extend( eventFunctions );
	simpleCart.extend( simpleCart.Item._ , eventFunctions );
	
	
	// basic simpleCart events
	var emptyFunc = function(){} , 
		events = 	{ 'beforeAdd' 			: emptyFunc
					, 'afterAdd' 			: emptyFunc
					, 'load' 				: emptyFunc
					, 'beforeSave' 			: emptyFunc
					, 'afterSave' 			: emptyFunc
					, 'update' 				: emptyFunc
					, 'ready' 				: emptyFunc
					, 'checkoutSuccess' 	: emptyFunc
					, 'checkoutFail' 		: emptyFunc
					, 'beforeCheckout'		: emptyFunc
				};
			
	// extend events in options
	simpleCart( events );
	
	//bind settings to events
	simpleCart.each( events , function( val , x , name ){
		simpleCart.bind( name , function(){
			if( isFunction( settings[name] ) ){
				settings[ name ].apply( this , arguments );
			}
		});
	});
	
	/*******************************************************************
	 * 	FORMATTING FUNCTIONS
	 *******************************************************************/
	simpleCart.extend({
		toCurrency: function(number,opts){
			var num = parseFloat(number,10),
				_opts = simpleCart.extend( simpleCart.extend({
					  symbol: 		"$"
					, decimal: 		"."
					, delimiter: 	","
					, accuracy:  	2
					, after: false
				}, simpleCart.currency() ), opts ),
				
				numParts = num.toFixed(_opts.accuracy).split("."),
				dec = numParts[1],
				ints = numParts[0];
							
			ints = simpleCart.chunk( ints.reverse() , 3 ).join(_opts.delimiter).reverse();
			
			return 	(!_opts.after ? _opts.symbol : "") + 
				  	ints + 
					(dec ? _opts.decimal + dec : "") +
					(_opts.after ? _opts.symbol : "");
					
		} ,
		
		
		// break a string in blocks of size n
		chunk: function(str, n) {
			if (typeof n==='undefined'){ 
				n=2;
			}
			var result = str.match(RegExp('.{1,'+n+'}','g'));
			return result || [];
		}
	
	});
	
	
	// reverse string function
	String.prototype.reverse = function(){
		return this.split("").reverse().join("");
	};
	
	
	// currency functions
	simpleCart.extend({
		currency: function(currency){
			if( isString(currency) && !isUndefined( currencies[currency] ) ){
				settings.currency = currency;
			} else if( isObject( currency ) ){
				currencies[currency.code] = currency;
				settings.currency = currency.code;
			} else {
				return currencies[settings.currency];
			}
		}
	});
	
	
	/*******************************************************************
	 * 	VIEW MANAGEMENT
	 *******************************************************************/
	var outletAndInputFunctions = {
		// bind outlets to function
		bindOutlets: function( outlets ){
			simpleCart.each( outlets , function( info , x ){
				simpleCart.bind( 'update' , function(){
					simpleCart.setOutlet( "." + namespace + "_" + info.selector , info.callback );
				});
			});
		},

		// set function return to outlet
		setOutlet: function( selector , func ){
			var val = func.call( simpleCart );
			if( val.el ){
				simpleCart.$( selector ).html( ' ' ).append( val );
			} else {
				simpleCart.$( selector ).text( val );
			}
		},
		
		// bind click events on inputs 
		bindInputs: function( inputs ){
			simpleCart.each( inputs , function( info , x ){
				simpleCart.setInput( "." + namespace + "_" + info.selector , info.event , info.callback );
			});
		},
		
		// attach events to inputs  
		setInput: function( selector , event , func ){
			simpleCart.$(selector).live( event, func );
		}
	} ,
	
	outlets = [
		{ 	  selector: 'total' 
		  	, callback: function(){
				return simpleCart.toCurrency( this.total() );
		    } 
		}
		, {   selector: 'quantity'
		  	, callback: function(){
				return simpleCart.quantity();
			} 
		}
		, {   selector: 'items'
		 	, callback: function(){
				return simpleCart.writeCart();
			} 
		}
	],
	
	inputs = [
		{ 	  selector: 'checkout' 
			, event: 'click'
		  	, callback: function(){
				simpleCart.checkout();
			}
		}
		, {   selector: 'empty'
			, event: 'click'
		  	, callback: function(){
				simpleCart.empty();
			}
		}
		, {   selector: 'increment'
			, event: 'click'
		  	, callback: function(e){
				simpleCart.find( simpleCart.$(this).parent().parent().attr('id').split("_")[1] ).increment();
				simpleCart.update();
			}
		}
		, {   selector: 'decrement'
			, event: 'click'
		  	, callback: function(e){
				simpleCart.find( simpleCart.$(this).parent().parent().attr('id').split("_")[1] ).decrement();
				simpleCart.update();
			}
		}
		/* remove from cart */
		, {   selector: 'remove'
			, event: 'click'
		  	, callback: function(e){
				simpleCart.find( simpleCart.$(this).parent().parent().attr('id').split("_")[1] ).remove();
			}
		}
		
		/* cart inputs */
		, {   selector: 'input'
			, event: 'change'
		  	, callback: function(e){
				var $input = simpleCart.$(this),
					$parent = $input.parent(),
					classList = $parent.attr('class').split(" ");
				simpleCart.each( classList , function(klass,x){
					if( klass.match(/item-.+/i) ){
						var field = klass.split("-")[1];
						simpleCart.find( $parent.parent().attr('id').split("_")[1] ).set(field,$input.val() );
						simpleCart.update();
						return;
					}
				});
			}
		}
		
		/* here is our shelfItem add to cart button listener */
		, {   selector: 'shelfItem .item_add'
			, event: 'click'
		  	, callback: function(e){
				var $button = simpleCart.$(this),
					fields = {};
					
				$button.closest("." + namespace + "_shelfItem" ).descendants().each(function(x,item){
					var $item = simpleCart.$(item);
					
					// check to see if the class matches the item_[fieldname] pattern
					if( $item.attr("class") && 
						$item.attr("class").match(/item_.+/) && 
						!$item.attr('class').match(/item_add/) ){
							
						// find the class name 
						simpleCart.each( $item.attr('class').split(' ') , function( klass , y ){
							
							// get the value or text depending on the tagName
							if( klass.match(/item_.+/) ){
								var attr = klass.split("_")[1],
									val = "";
								switch( $item.tag().toLowerCase() ){
									case "input":
									case "checkbox":
									case "textarea":
									case "select":
										val = $item.val();
										break;
									default:
										val = $item.text();
										break;
								}
								fields[attr.toLowerCase()] = val;
							}
						});
					}
				});
				
				// add the item
				simpleCart.add(fields);
			}
		}
	];
	
	simpleCart.extend( outletAndInputFunctions );					

	
	// class for wrapping DOM selector shit
	var ELEMENT = simpleCart.ELEMENT = function( el , selector ){
		this.el = el;
		this.selector = selector || null; // "#" + this.attr('id'); TODO: test length?
	},
	
	_VALUE_ 	= 'value',
	_TEXT_	 	= 'text',
	_HTML_ 		= 'html',
	_CLICK_ 	= 'click',
	
	selectorFunctions = {
		
		"MooTools"		: {
			text: function( text ){
				return this.attr( _TEXT_ , text );
			} ,
			html: function( html ){
				return this.attr( _HTML_ , html );
			} ,
			val: function( val ){
				return this.attr( _VALUE_ , val );
			} ,
			attr: function( attr , val ){
				if( isUndefined( val ) ){
					return this.el.get( attr )
				} else { 
					this.el.set( attr , val );
					return this;
				}
			} ,
			remove: function(){
				this.el.dispose();
				return null;
			} , 
			addClass: function( klass ){
				this.el.addClass( klass );
				return this;
			} ,
			removeClass: function( klass ){
				this.el.removeClass( klass );
				return this;
			} ,
			each: function (callback){
				if( isFunction(callback) ){
					simpleCart.each( this.el , callback );
				}
				return this;
			} ,
			click: function(callback){
				if( isFunction(callback) ){
					this.each(function(e,x){
						e.addEvent(_CLICK_, function(ev){
							callback.call(e,ev);
						});
					});
				} else if( isUndefined( callback ) ){
					this.el.fireEvent(_CLICK_);
				}
				
				return this;
			} ,
			live: function(	event,callback ){
				var selector = this.selector;
				if( isFunction( callback) ){
					simpleCart.$(document).addEvent( event , function(e){
						var target = simpleCart.$(e.target);
						if( target.match(selector) ){
							callback.call( target , e );
						}
					});
				}
			} ,
			match: function(selector){
				return this.el.match(selector);
			} ,
			parent: function(){
				return simpleCart.$( this.el.getParent() );
			} ,
			find: function( selector ){
				return simpleCart.$( this.el.getElements( selector ) );
			} ,
			closest: function( selector ){
				return simpleCart.$( this.el.getParent( selector ) );
			} ,
			descendants: function(){
				return this.find("*");
			} ,
			tag: function(){
				return this.el[0].tagName;
			}
			
			
		},
		
		"Prototype"		: {
			text: function( text ){
				if( isUndefined( text ) ){ 
					return this.el[0].innerHTML; 
				} else {
					this.each(function(e,x){
						e.update( text );	
					});
					return this;
				} 
			} ,
			html: function( html ){
				return this.text( html );
			} ,
			val: function( val ){
				return this.attr( _VALUE_ , val );
			} ,
			attr: function( attr , val ){
				if( isUndefined( val ) ){	
					return this.el[0].readAttribute( attr );
				} else {
					this.each(function(e,x){
						e.writeAttribute( attr , val );
					});
					return this;
				}
			} ,
			remove: function(){
				this.each(function(e,x){
					e.remove();
				});
				return this;
			} ,
			addClass: function( klass ){
				this.each(function(e,x){
					e.addClassName( klass );
				});
				return this;
			} , 
			removeClass: function( klass ){
				this.each(function(e,x){
					e.removeClassName( klass );
				});
				return this;
			} ,
			each: function (callback){
				if( isFunction(callback) ){
					simpleCart.each( this.el , callback );
				}
				return this;
			} ,
			click: function(callback){
				if( isFunction(callback) ){
					this.each(function(e,x){
						e.observe( _CLICK_ , function(ev){
							callback.call(e,ev);
						});
					});
				} else if( isUndefined(callback) ) {
					this.each(function(e,x){
						e.fire(_CLICK_);
					});
				}
				return this;
			} ,
			live: function(event,callback){
				if( isFunction(callback) ){
					var selector = this.selector;
					document.observe( event, function( e, el ){
						if( el == e.findElement(selector) ){
							callback.call( el , e );
						}
					});
				}
			} ,
			parent: function(){
				return simpleCart.$( this.el.up() );
			} ,
			find: function( selector ){
				return simpleCart.$( this.el.getElementsBySelector( selector ) );
			} ,
			closest: function( selector ){
				return simpleCart.$( this.el.up( selector ) );
			} ,
			descendants: function(){
				return simpleCart.$( this.el.descendants() );
			} ,
			tag: function( ){
				return this.el.tagName;
			}
			
			
			
		},
		
		"jQuery"		: {
			passthrough: function( action , val ){
				if( isUndefined( val ) ){
					return this.el[action]();
				} else {
					this.el[action]( val );
					return this;
				}
			} ,
			text: function( text ){
				return this.passthrough( _TEXT_ , text );
			} ,
			html: function( html ){
				return this.passthrough( _HTML_ , html );
			} ,
			val: function( val ){
				return this.passthrough( "val" , val );
			} ,
			append: function( item ){
				var target = item.el || item;
				this.el.append( target );
				return this;
			} ,
			attr: function( attr , val ){
				if( isUndefined( val ) ){
					return this.el.attr( attr );
				} else {
					this.el.attr( attr , val );
					return this;
				} 
			} ,
			remove: function(){
				this.el.remove();
				return this;
			} ,
			addClass: function( klass ){
				this.el.addClass( klass );
				return this;
			} , 
			removeClass: function( klass ){
				this.el.removeClass( klass );
				return this;
			} ,
			each: function( callback ){
				return this.passthrough( 'each' , callback );
			} ,
			click: function( callback ){
				return this.passthrough( _CLICK_ , callback );
			} ,
			live: function( event , callback ){
				jQuery(document).delegate( this.selector , event , callback );
				return this;
			} ,
			parent: function( ){
				return simpleCart.$(this.el.parent());
			} ,
			find: function( selector ){
				return simpleCart.$( this.el.find( selector ) );
			} ,
			closest: function( selector ){
				return simpleCart.$( this.el.closest( selector ) );
			} ,
			tag: function(){
				return this.el[0].tagName;
			} ,
			descendants: function(){
				return simpleCart.$(this.el.find("*") );
			}
			
			
		}
	};
	ELEMENT._ = ELEMENT.prototype;
	
	// bind the DOM setup to the ready event
	simpleCart.ready( simpleCart.setupViewTool );
	
	// bind the input and output events 
	simpleCart.ready(function(){
		simpleCart.bindOutlets( outlets );
		simpleCart.bindInputs( inputs );
	});


	/*******************************************************************
	 * 	DOM READY 
	 *******************************************************************/
	// Cleanup functions for the document ready method
	// used from jQuery
	if ( document.addEventListener ) {
		DOMContentLoaded = function() {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			simpleCart.init();
		};

	} else if ( document.attachEvent ) {
		DOMContentLoaded = function() {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", DOMContentLoaded );
				simpleCart.init();
			}
		};
	}
	// The DOM ready check for Internet Explorer
	// used from jQuery
	function doScrollCheck() {
		if ( simpleCart.isReady ) {
			return;
		}

		try {
			// If IE is used, use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			document.documentElement.doScroll("left");
		} catch(e) {
			setTimeout( doScrollCheck, 1 );
			return;
		}

		// and execute any waiting functions
		simpleCart.init();
	}
	
	// bind the ready event
	simpleCart.bindReady();	
	
	
	return simpleCart;
};


window.simpleCart = generateSimpleCart();

}(window));
