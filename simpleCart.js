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
	
	
var	typeof_undefined		= typeof undefined,
	typeof_function			= typeof function(){},
	typeof_object			= typeof {},
	isTypeOf				= function( item , type ){ return typeof item === type },
	isUndefined				= function( item ){ return isTypeOf( item , typeof_undefined ); },
	isFunction				= function( item ){ return isTypeOf( item , typeof_function ); },
	isObject				= function( item ){ return isTypeOf( item , typeof_object ); },
	
	
	
	
simpleCart = (function(){	

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
	namespace 				= "simpleCart",
	
	
	// Currencies
	currencies = {
		  "USD": [ "USD", "$", "US Dollar" ] 
		, "AUD": [ "AUD", "$", "Australian Dollar" ] 
	},
	
	// default options
	settings = {
		  checkout				: "PayPal"
		, currency				: "USD"
		, language				: "english-us"
		, cookieDuration		: 30
		
		, paypalHTTPMethod		: "GET"
		, paypalSandbox			: false
		, storagePrefix			: "sc_"
		, email					: ""
	}, 
	
	
	// main simpleCart object, function call is used for setting options
 	simpleCart = function( options ){
		return simpleCart.extend( settings , options );
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
		
	// add in the core functionality 	
	simpleCart.extend({
		
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
		
		// check to see if item is in the cart already
		has: function( item ){
			var current, 
				matches,
				field,
				match=false;

			simpleCart.each(function(testItem){ 
				matches = true;
				simpleCart.each( item , function( value , x , field ){ 
					if( field !== "quantity" && field !== "id" && item[field] !== testItem[field] ){
						matches = false;
					}
				});

				if( matches ){
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
			simpleCart.update();
			simpleCart.trigger('ready');
		},
		
		
		// view management
		$:{},
		
		setupViewTool: function(){
			// Determine the "best fit" selector engine
			for (var engine in selectorEngines) {
				var members, member, context = win;
				if (window[engine]) {
					members = selectorEngines[engine].replace("*", engine).split(".");
					while ((member = members.shift()) && (context = context[member])) {}
					if (typeof context == "function") {
						simpleCart.$.get = context;
						simpleCart.extend( simpleCart.$ , selectorFunctions[ engine ] );
						return;
					}
				}
			}
		}, 
		
		
		// storage 
		
		save: function(){
			
		}, 
		
		load: function(){
			
		}
		
		
		
	});
	
	// class for cart items
	var Item = simpleCart.Item = function( info ){
		
		// we use the data object to track values for the item
		var _data = {},
			me = this;
			
		// cycle through given attributes and set them to the data object
		if( isObject( info ) ){
			for( var attr in info ){
				if( !isFunction( info[attr] ) && !isObject( info[attr] ) ){
					_data[attr] = info[attr];
				}
			}		
		}
		
		/* TODO: save callbacks */
			
		// set the item id
		_data.id = _data.id || item_id_namespace + (++item_id); 
		while( !isUndefined( sc_items[_data.id] ) ){
			_data.id = item_id_namespace + (++item_id); 
		}
		
		// getter and setter methods to access private variables
		me.get = function( name , usePrototypes ){
			
			usePrototypes = isUndefined( usePrototypes ) && usePrototypes;
			
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
				_data[name] = value;
			}
			return me;
		};
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
			return isUndefined( val ) ? parseInt( this.get("quantity",false) || 1 , 10 ) : this.set("quantity", val );
		},
		price: function( val ){
			return isUndefined( val ) ? parseFloat(  this.get("price",false) || 1 ) : this.set("price", val );
		},
		id: function(){
			return this.get( 'id',false );
		},
		total:function(){
			return this.quantity()*this.price();
		}
		
	};
	
	
	
	// Event Management
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
	
	
	// selector engines 
	var selectorFunctions = {
		
		"MooTools"		: {
			text: function( selector , text ){
				if( isUndefined( text ) ){
					return simpleCart.$.get( selector ).get('text');
				} else {
					return simpleCart.$.get( selector ).set( 'text' , text );
				}
			} ,
			val: function( selector , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).get('value');
				} else {
					return simpleCart.$.get( selector ).set( 'value' , val );
				}
			} ,
			attr: function( selector , attr , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).get( attr );
				} else {
					return simpleCart.$.get( selector ).set( attr , val );
				}
			} ,
			remove: function( selector ){
				return simpleCart.$.get( selector ).dispose();
			}
		},
		
		"Prototype"		: {
			text: function( selector , text ){
				if( isUndefined( text ) ){
					return simpleCart.$.get( selector ).innerHTML;
				} else {
					return simpleCart.$.get( selector ).update( text );
				}
			} ,
			val: function( selector , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).readAttribute( 'value' );
				} else {
					return simpleCart.$.get( selector ).writeAttribute( 'value' , val );
				}
			} ,
			attr: function( selector , attr , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).readAttribute( attr );
				} else {
					return simpleCart.$.get( selector ).writeAttribute( attr , val );
				}
			} ,
			remove: function( selector ){
				return simpleCart.$.get( selector ).remove();
			}
		},
		
		"jQuery"		: {
			text: function( selector , text ){
				if( isUndefined( text ) ){
					return simpleCart.$.get( selector ).text();
				} else {
					return simpleCart.$.get( selector ).text( text );
				}
			} ,
			val: function( selector , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).val();
				} else {
					return simpleCart.$.get( selector ).val( val );
				}
			} ,
			attr: function( selector , attr , val ){
				if( isUndefined( val ) ){
					return simpleCart.$.get( selector ).attr( attr );
				} else {
					return simpleCart.$.get( selector ).attr( attr , val );
				}
			} ,
			remove: function( selector ){
				return simpleCart.$.get( selector ).remove();
			} 
		}
	};
	
	// bind the DOM setup to the ready event
	simpleCart.bind( 'ready', simpleCart.setupViewTool );

	ContentLoaded(window, simpleCart.init );
	
	
	/*!
	 * ContentLoaded.js by Diego Perini, modified for IE<9 only (to save space)
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 */

	// @w window reference
	// @f function reference
	function ContentLoaded(win, fn) {

		var done = false, top = true,
		init = function(e) {
			if (e.type == "readystatechange" && document.readyState != "complete") return;
			(e.type == "load" ? win : document).detachEvent("on" + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},
		poll = function() {
			try { root.doScroll("left"); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};

		if (document.readyState == "complete") fn.call(win, EMPTY_STRING);
		else {
			if (document.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
				if (top) poll();
			}
		}
	};
	
	
	return simpleCart;
}());

	
	
	

window.simpleCart = simpleCart;
}(window));
