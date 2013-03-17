/*
 * Simplecart.js
 *
 * @author     wojodesign.com
 * @copyright  2012-2013
 * @license    Dual licensed under the MIT or GPL licenses
 * @version    3.0.5
 *
 * @modified
 * @date 	   2013-01-28
 * @author     mikepage <http://github.com/mikepage>
 */

(function (window, document) {

	var typeof_string			= typeof "",
		typeof_undefined		= typeof undefined,
		typeof_function			= typeof function () {},
		typeof_object			= typeof {},
		isTypeOf				= function (item, type) { return typeof item === type; },
		isString				= function (item) { return isTypeOf(item, typeof_string); },
		isUndefined				= function (item) { return isTypeOf(item, typeof_undefined); },
		isFunction				= function (item) { return isTypeOf(item, typeof_function); },
		isObject				= function (item) { return isTypeOf(item, typeof_object); },
		isElement				= function (o) {
			return typeof HTMLElement === "object" ? o instanceof HTMLElement : typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string";
		},

		generateSimpleCart = function (space) {

			var selectorEngines = { "jQuery" : "*" },

				item_id					= 0,
				item_id_namespace		= "SCI-",
				sc_items				= {},
				namespace				= space || "simpleCart",
				selectorFunctions		= {},
				eventFunctions			= {},
				baseEvents				= {},

				localStorage			= window.localStorage,
				console					= window.console || { msgs: [], log: function (msg) { console.msgs.push(msg); } },

				// For views 
				_VALUE_		= 'value',
				_TEXT_		= 'text',
				_HTML_		= 'html',
				_CLICK_		= 'click',

				// Currencies
				currencies = {
					"USD": { code: "USD", symbol: "&#36;", name: "US Dollar" },
					"AUD": { code: "AUD", symbol: "&#36;", name: "Australian Dollar" },
					"BRL": { code: "BRL", symbol: "R&#36;", name: "Brazilian Real" },
					"CAD": { code: "CAD", symbol: "&#36;", name: "Canadian Dollar" },
					"CZK": { code: "CZK", symbol: "&nbsp;&#75;&#269;", name: "Czech Koruna", after: true },
					"DKK": { code: "DKK", symbol: "DKK&nbsp;", name: "Danish Krone" },
					"EUR": { code: "EUR", symbol: "&euro;", name: "Euro" },
					"HKD": { code: "HKD", symbol: "&#36;", name: "Hong Kong Dollar" },
					"HUF": { code: "HUF", symbol: "&#70;&#116;", name: "Hungarian Forint" },
					"ILS": { code: "ILS", symbol: "&#8362;", name: "Israeli New Sheqel" },
					"JPY": { code: "JPY", symbol: "&yen;", name: "Japanese Yen" },
					"MXN": { code: "MXN", symbol: "&#36;", name: "Mexican Peso" },
					"NOK": { code: "NOK", symbol: "NOK&nbsp;", name: "Norwegian Krone" },
					"NZD": { code: "NZD", symbol: "&#36;", name: "New Zealand Dollar" },
					"PLN": { code: "PLN", symbol: "PLN&nbsp;", name: "Polish Zloty" },
					"GBP": { code: "GBP", symbol: "&pound;", name: "Pound Sterling" },
					"SGD": { code: "SGD", symbol: "&#36;", name: "Singapore Dollar" },
					"SEK": { code: "SEK", symbol: "SEK&nbsp;", name: "Swedish Krona" },
					"CHF": { code: "CHF", symbol: "CHF&nbsp;", name: "Swiss Franc" },
					"THB": { code: "THB", symbol: "&#3647;", name: "Thai Baht" },
					"BTC": { code: "BTC", symbol: " BTC", name: "Bitcoin", accuracy: 4, after: true	}
				},

				// Default options
				settings = {
					checkout: {
						type: "PayPal",
						email: "you@yours.com"
					},
					currency: "EUR",
					language: "english-uk",

					cartStyle: "div",
					cartColumns: [
						{ attr: "name", label: "Name" },
						{ attr: "price", label: "Price", view: 'currency' },
						{ view: "decrement", label: false },
						{ attr: "quantity", label: "Qty" },
						{ view: "increment", label: false },
						{ attr: "total", label: "SubTotal", view: 'currency' },
						{ view: "remove", text: "Remove", label: false }
					],

					excludeFromCheckout	: ['thumb'],

					shippingFlatRate		: 0,
					shippingQuantityRate	: 0,
					shippingTotalRate		: 0,
					shippingCustom		: null,

					taxRate				: 0,
					taxShipping			: true,
					taxIncluded			: true,

					data				: {}
				},


				// Main simpleCart object, function call is used for setting options
				simpleCart = function (options) {
					// Shortcut for simpleCart.ready
					if (isFunction(options)) {
						return simpleCart.ready(options);
					}

					// Set options
					if (isObject(options)) {
						return simpleCart.extend(settings, options);
					}
				},

				// Selector engine
				$engine,

				// Built in cart views for item cells
				cartColumnViews;

			// Function for extending objects
			simpleCart.extend = function (target, opts) {
				var next;

				if (isUndefined(opts)) {
					opts = target;
					target = simpleCart;
				}

				for (next in opts) {
					if (Object.prototype.hasOwnProperty.call(opts, next)) {
						target[next] = opts[next];
					}
				}
				return target;
			};

			// Create copy function
			simpleCart.extend({
				copy: function (n) {
					var cp = generateSimpleCart(n);
					cp.init();
					return cp;
				}
			});

			// Add in the core functionality
			simpleCart.extend({

				isReady: false,

				// This is where the magic happens, the add function
				add: function (values, opt_quiet) {
					var info		= values || {},
						newItem		= new simpleCart.Item(info),
						addItem 	= true,
						// Optionally supress event triggers
						quiet 		= opt_quiet === true ? opt_quiet : false,
						oldItem;

					// Trigger before add event
					if (!quiet) {
					  	addItem = simpleCart.trigger('beforeAdd', [newItem]);
					
						if (addItem === false) {
							return false;
						}
					}
					
					// If the new item already exists, increment the value
					oldItem = simpleCart.has(newItem);
					if (oldItem) {
						oldItem.increment(newItem.quantity());
						newItem = oldItem;

					// Otherwise add the item
					} else {
						sc_items[newItem.id()] = newItem;
					}

					// Update the cart
					simpleCart.update();

					if (!quiet) {
						// Trigger after add event
						simpleCart.trigger('afterAdd', [newItem, isUndefined(oldItem)]);
					}

					// Return a reference to the added item
					return newItem;
				},


				// Iteration function
				each: function (array, callback) {
					var next,
						x = 0,
						result,
						cb,
						items;

					if (isFunction(array)) {
						cb = array;
						items = sc_items;
					} else if (isFunction(callback)) {
						cb = callback;
						items = array;
					} else {
						return;
					}

					for (next in items) {
						if (Object.prototype.hasOwnProperty.call(items, next)) {
							result = cb.call(simpleCart, items[next], x, next);
							if (result === false) {
								return;
							}
							x += 1;
						}
					}
				},

				find: function (id) {
					var items = [];

					// Return object for id if it exists
					if (isObject(sc_items[id])) {
						return sc_items[id];
					}
					// Search through items with the given criteria
					if (isObject(id)) {
						simpleCart.each(function (item) {
							var match = true;
							simpleCart.each(id, function (val, x, attr) {

								if (isString(val)) {
									// Less than or equal to
									if (val.match(/<=.*/)) {
										val = parseFloat(val.replace('<=', ''));
										if (!(item.get(attr) && parseFloat(item.get(attr)) <= val)) {
											match = false;
										}

									// Less than
									} else if (val.match(/</)) {
										val = parseFloat(val.replace('<', ''));
										if (!(item.get(attr) && parseFloat(item.get(attr)) < val)) {
											match = false;
										}

									// Greater than or equal to
									} else if (val.match(/>=/)) {
										val = parseFloat(val.replace('>=', ''));
										if (!(item.get(attr) && parseFloat(item.get(attr)) >= val)) {
											match = false;
										}

									// Greater than
									} else if (val.match(/>/)) {
										val = parseFloat(val.replace('>', ''));
										if (!(item.get(attr) && parseFloat(item.get(attr)) > val)) {
											match = false;
										}

									// equal to
									} else if (!(item.get(attr) && item.get(attr) === val)) {
										match = false;
									}

								// Equal to non string
								} else if (!(item.get(attr) && item.get(attr) === val)) {
									match = false;
								}

								return match;
							});

							// Add the item if it matches
							if (match) {
								items.push(item);
							}
						});
						return items;
					}

					// If no criteria is given we return all items
					if (isUndefined(id)) {

						// Use a new array so we don't give a reference to the cart's item array
						simpleCart.each(function (item) {
							items.push(item);
						});
						return items;
					}

					// Return empty array as default
					return items;
				},

				// Return all items
				items: function () {
					return this.find();
				},

				// Check to see if item is in the cart already
				has: function (item) {
					var match = false;

					simpleCart.each(function (testItem) {
						if (testItem.equals(item)) {
							match = testItem;
						}
					});
					return match;
				},

				// Empty the cart
				empty: function () {
					// Remove each item individually so we see the remove events
					var newItems = {};
					simpleCart.each(function (item) {
						// Send a param of true to make sure it doesn't update after every removal.
						// Keep the item if the function returns false, because we know it has been prevented from being removed
						if (item.remove(true) === false) {
							newItems[item.id()] = item
						}
					});
					sc_items = newItems;
					simpleCart.update();
				},


				// Functions for accessing cart info
				quantity: function () {
					var quantity = 0;
					simpleCart.each(function (item) {
						quantity += item.quantity();
					});
					return quantity;
				},

				total: function () {
					var total = 0;
					simpleCart.each(function (item) {
						total += item.total();
					});
					return total;
				},

				grandTotal: function () {
					return settings.taxIncluded ? simpleCart.total() + simpleCart.shipping() : simpleCart.total() + simpleCart.shipping() + simpleCart.tax();
				},

				// Updating functions
				update: function () {
					simpleCart.save();
					simpleCart.trigger("update");
				},

				init: function () {
					simpleCart.load();
					simpleCart.update();
					simpleCart.ready();
				},

				// View management
				$: function (selector) {
					return new simpleCart.ELEMENT(selector);
				},

				$create: function (tag) {
					return simpleCart.$(document.createElement(tag));
				},

				setupViewTool: function () {
					var members, member, context = window, engine;

					// Determine the "best fit" selector engine
					for (engine in selectorEngines) {
						if (Object.prototype.hasOwnProperty.call(selectorEngines, engine) && window[engine]) {
							members = selectorEngines[engine].replace("*", engine).split(".");
							member = members.shift();
							if (member) {
								context = context[member];
							}
							if (typeof context === "function") {
								// set the selector engine and extend the prototype of our
								// element wrapper class
								$engine = context;
								simpleCart.extend(simpleCart.ELEMENT._, selectorFunctions[engine]);
								return;
							}
						}
					}
				},

				// Return a list of id's in the cart
				ids: function () {
					var ids = [];
					simpleCart.each(function (item) {
						ids.push(item.id());
					});
					return ids;

				},

				// Storage
				save: function () {
					simpleCart.trigger('beforeSave');

					var items = {};

					// Save all the items
					simpleCart.each(function (item) {
						items[item.id()] = simpleCart.extend(item.fields(), item.options());
					});

					localStorage.setItem(namespace + "_items", JSON.stringify(items));

					simpleCart.trigger('afterSave');
				},

				load: function () {

					sc_items = {};

					var items = localStorage.getItem(namespace + "_items");

					if (!items) {
						return;
					}
					
					// Catch any JSON parsing errors
					try {
						simpleCart.each(JSON.parse(items), function (item) {
							simpleCart.add(item, true);
						});
					} catch (e){
						simpleCart.error( "Error Loading data: " + e );
					}

					simpleCart.trigger('load');
				},

				// Ready function used as a shortcut for bind('ready',fn)
				ready: function (fn) {

					if (isFunction(fn)) {
						// Call function if already ready already
						if (simpleCart.isReady) {
							fn.call(simpleCart);

						// Bind if not ready
						} else {
							simpleCart.bind('ready', fn);
						}

					// Trigger ready event
					} else if (isUndefined(fn) && !simpleCart.isReady) {
						simpleCart.trigger('ready');
						simpleCart.isReady = true;
					}

				},

				error: function (message) {
					var msg = "";
					if (isString(message)) {
						msg = message;
					} else if (isObject(message) && isString(message.message)) {
						msg = message.message;
					}
					try { console.log("simpleCart(js) Error: " + msg); } catch (e) {}
					simpleCart.trigger('error', [message]);
				}
			});


			// Tax and shipping
			simpleCart.extend({

				tax: function () {
					if (settings.taxShipping) {
						shipping = simpleCart.shipping();
						shippingTaxRate = simpleCart.taxRate();
						cost = settings.taxIncluded ? shipping * (shippingTaxRate/(1 + shippingTaxRate)) : shipping * shippingTaxRate;
					}
					
					simpleCart.each(function (item) {
						if (item.get('tax')) {
							cost += item.get('tax');
						} else if (item.get('taxrate')) {
							taxrate = parseFloat(item.get('taxrate'));
							cost += settings.taxIncluded ? item.total() * (taxrate/(1 + taxrate)) : item.total() * taxrate;
						}
					});
					return parseFloat(cost);
				},
				
				taxRate: function () {
					return settings.taxRate || 0;
				},

				shipping: function (opt_custom_function) {

					if (isFunction(opt_custom_function)) {
						simpleCart({
							shippingCustom: opt_custom_function
						});
						return;
					}

					var cost = settings.shippingQuantityRate * simpleCart.quantity() +
							settings.shippingTotalRate * simpleCart.total() +
							settings.shippingFlatRate;

					if (isFunction(settings.shippingCustom)) {
						cost += settings.shippingCustom.call(simpleCart);
					}

					simpleCart.each(function (item) {
						cost += parseFloat(item.get('shipping') || 0);
					});
					return parseFloat(cost);
				}

			});

			// Cart views
			cartColumnViews = {
				attr: function (item, column) {
					return item.get(column.attr) || "";
				},

				currency: function (item, column) {
					return simpleCart.toCurrency(item.get(column.attr) || 0);
				},

				link: function (item, column) {
					return "<a href='" + item.get(column.attr) + "'>" + column.text + "</a>";
				},

				decrement: function (item, column) {
					return "<a href='javascript:;' class='" + namespace + "_decrement'>" + (column.text || "-") + "</a>";
				},

				increment: function (item, column) {
					return "<a href='javascript:;' class='" + namespace + "_increment'>" + (column.text || "+") + "</a>";
				},

				image: function (item, column) {
					return "<img src='" + item.get(column.attr) + "'/>";
				},

				input: function (item, column) {
					return "<input type='text' value='" + item.get(column.attr) + "' class='" + namespace + "_input'/>";
				},

				remove: function (item, column) {
					return "<a href='javascript:;' class='" + namespace + "_remove'>" + (column.text || "X") + "</a>";
				}
			};

			// Cart column wrapper class and functions
			function cartColumn(opts) {
				var options = opts || {};
				return simpleCart.extend({
					attr			: "",
					label			: "",
					view			: "attr",
					text			: "",
					className		: "",
					hide			: false
				}, options);
			}

			function cartCellView(item, column) {
				var viewFunc = isFunction(column.view) ? column.view : isString(column.view) && isFunction(cartColumnViews[column.view]) ? cartColumnViews[column.view] : cartColumnViews.attr;

				return viewFunc.call(simpleCart, item, column);
			}

			simpleCart.extend({
				// Write out cart
				writeCart: function (selector) {
					var TABLE = settings.cartStyle.toLowerCase(),
						isTable = TABLE === 'table',
						TR = isTable ? "tr" : "div",
						TH = isTable ? 'th' : 'div',
						TD = isTable ? 'td' : 'div',
						cart_container = simpleCart.$create(TABLE),
						header_container = simpleCart.$create(TR).addClass('headerRow'),
						container = simpleCart.$(selector),
						column,
						klass,
						label,
						x,
						xlen;

					container.html(' ').append(cart_container);

					cart_container.append(header_container);

					// Create header
					for (x = 0, xlen = settings.cartColumns.length; x < xlen; x += 1) {
						column	= cartColumn(settings.cartColumns[x]);
						klass	=  "item-" + (column.attr || column.view || column.label || column.text || "cell") + " " + column.className;
						label	= column.label || "";

						// Append the header cell
						header_container.append(
							simpleCart.$create(TH).addClass(klass).html(label)
						);
					}

					// Cycle through the items
					simpleCart.each(function (item, y) {
						simpleCart.createCartRow(item, y, TR, TD, cart_container);
					});

					return cart_container;
				},

				// Generate a cart row from an item
				createCartRow: function (item, y, TR, TD, container) {
					var row = simpleCart.$create(TR)
										.addClass('itemRow row-' + y + " " + (y % 2 ? "even" : "odd"))
										.attr('id', "cartItem_" + item.id()),
						j,
						jlen,
						column,
						klass,
						content,
						cell;

					container.append(row);

					// Cycle through the columns to create each cell for the item
					for (j = 0, jlen = settings.cartColumns.length; j < jlen; j += 1) {
						column	= cartColumn(settings.cartColumns[j]);
						klass	= "item-" + (column.attr || (isString(column.view) ? column.view : column.label || column.text || "cell")) + " " + column.className;
						content = cartCellView(item, column);
						cell	= simpleCart.$create(TD).addClass(klass).html(content);

						row.append(cell);
					}
					return row;
				}

			});

			// Cart items management
			simpleCart.Item = function (info) {

				var _data = {},
					me = this;

				if (isObject(info)) {
					simpleCart.extend(_data, info);
				}

				item_id += 1;
				_data.id = _data.id || item_id_namespace + item_id;
				while (!isUndefined(sc_items[_data.id])) {
					item_id += 1;
					_data.id = item_id_namespace + item_id;
				}

				function checkQuantityAndPrice() {
					// Check to make sure price is valid
					if (isString(_data.price)) {
					   // Trying to remove all chars that aren't numbers or '.'
						_data.price = parseFloat(_data.price.replace(simpleCart.currency().decimal, ".").replace(/[^0-9\.]+/ig, ""));

					}
					if (isNaN(_data.price)) {
						_data.price = 0;
					}
					if (_data.price < 0) {
						_data.price = 0;
					}

					// Check to make sure quantity is valid
					if (isString(_data.quantity)) {
						_data.quantity = parseInt(_data.quantity.replace(simpleCart.currency().delimiter, ""), 10);
					}
					if (isNaN(_data.quantity)) {
						_data.quantity = 1;
					}
					if (_data.quantity <= 0) {
						me.remove();
					}

				}

				// Getter and setter methods to access private variables
				me.get = function (name, skipPrototypes) {

					var usePrototypes = !skipPrototypes;

					if (isUndefined(name)) {
						return name;
					}

					// Return the value in order of the data object and then the prototype
					return isFunction(_data[name])	? _data[name].call(me) :
							!isUndefined(_data[name]) ? _data[name] :

							isFunction(me[name]) && usePrototypes		? me[name].call(me) :
							!isUndefined(me[name]) && usePrototypes	? me[name] :
							_data[name];
				};
				me.set = function (name, value) {
					if (!isUndefined(name)) {
						_data[name.toLowerCase()] = value;
						if (name.toLowerCase() === 'price' || name.toLowerCase() === 'quantity') {
							checkQuantityAndPrice();
						}
					}
					return me;
				};
				me.equals = function (item) {
					for( var label in _data ){
						if (Object.prototype.hasOwnProperty.call(_data, label)) {
							if (label !== 'quantity' && label !== 'id') {
								if (item.get(label) !== _data[label]) {
									return false;
								}
							}
						}
					}
					return true;
				};
				me.options = function () {
					var data = {};
					simpleCart.each(_data,function (val, x, label) {
						var add = true;
						simpleCart.each(me.reservedFields(), function (field) {
							if (field === label) {
								add = false;
							}
							return add;
						});

						if (add) {
							data[label] = me.get(label);
						}
					});
					return data;
				};


				checkQuantityAndPrice();
				
				//return item to caller
				return me;
			};

			simpleCart.Item._ = simpleCart.Item.prototype = {

				// Editing the item quantity
				increment: function (amount) {
					var diff = amount || 1;
					diff = parseInt(diff, 10);

					this.quantity(this.quantity() + diff);
					if (this.quantity() < 1) {
						this.remove();
						return null;
					}
					return this;

				},
				decrement: function (amount) {
					var diff = amount || 1;
					return this.increment(-parseInt(diff, 10));
				},
				remove: function (skipUpdate) {
					var removeItemBool = simpleCart.trigger("beforeRemove", [sc_items[this.id()]]);
					if (removeItemBool === false ) {
						return false;
					}
					delete sc_items[this.id()];
					if (!skipUpdate) { 
						simpleCart.update();
					}
					return null;
				},

				// Special fields for items
				reservedFields: function () {
					return ['quantity', 'id', 'item_number', 'price', 'name', 'shipping', 'tax', 'taxRate'];
				},

				// Return values for all reserved fields if they exist
				fields: function () {
					var data = {},
						me = this;
					simpleCart.each(me.reservedFields(), function (field) {
						if (me.get(field)) {
							data[field] = me.get(field);
						}
					});
					return data;
				},

				quantity: function (val) {
					return isUndefined(val) ? parseInt(this.get("quantity", true) || 1, 10) : this.set("quantity", val);
				},
				price: function (val) {
					return isUndefined(val) ?
							parseFloat((this.get("price",true).toString()).replace(simpleCart.currency().symbol,"").replace(simpleCart.currency().delimiter,"") || 1) :
							this.set("price", parseFloat((val).toString().replace(simpleCart.currency().symbol,"").replace(simpleCart.currency().delimiter,"")));
				},
				id: function () {
					return this.get('id',false);
				},
				total:function () {
					return this.quantity()*this.price();
				}

			};

			// Checkout management
			simpleCart.extend({
				checkout: function () {
					if (settings.checkout.type.toLowerCase() === 'custom' && isFunction(settings.checkout.fn)) {
						settings.checkout.fn.call(simpleCart,settings.checkout);
					} else if (isFunction(simpleCart.checkout[settings.checkout.type])) {
						var checkoutData = simpleCart.checkout[settings.checkout.type].call(simpleCart,settings.checkout);
						
						// If the checkout method returns data, try to send the form
						if( checkoutData.data && checkoutData.action && checkoutData.method ){
							// If no one has any objections, send the checkout form
							if( false !== simpleCart.trigger('beforeCheckout', [checkoutData.data]) ){
								simpleCart.generateAndSendForm( checkoutData );
							}
						}
						
					} else {
						simpleCart.error("No Valid Checkout Method Specified");
					}
				},
				extendCheckout: function (methods) {
					return simpleCart.extend(simpleCart.checkout, methods);
				},
				generateAndSendForm: function (opts) {
					var form = simpleCart.$create("form");
					form.attr('style', 'display:none;');
					form.attr('action', opts.action);
					form.attr('method', opts.method);
					simpleCart.each(opts.data, function (val, x, name) {
						form.append(
							simpleCart.$create("input").attr("type","hidden").attr("name",name).val(val)
						);
					});
					simpleCart.$("body").append(form);
					form.el.submit();
					form.remove();
				}
			});

			simpleCart.extendCheckout({
				PayPal: function (opts) {
					// Account email is required
					if (!opts.email) {
						return simpleCart.error("No email provided for PayPal checkout");
					}

					// Build basic form options
					var data = {
							  cmd			: "_cart"
							, upload		: "1"
							, currency_code : simpleCart.currency().code
							, business		: opts.email
							, rm			: opts.method === "GET" ? "0" : "2"
							, tax_cart		: (simpleCart.tax()*1).toFixed(2)
							, handling_cart : (simpleCart.shipping()*1).toFixed(2)
							, charset		: "utf-8"
						},
						action = opts.sandbox ? "https://www.sandbox.paypal.com/cgi-bin/webscr" : "https://www.paypal.com/cgi-bin/webscr",
						method = opts.method === "GET" ? "GET" : "POST";


					// check for return and success URLs in the options
					if (opts.success) {
						data['return'] = opts.success;
					}
					if (opts.cancel) {
						data.cancel_return = opts.cancel;
					}

					// Add all the items to the form data
					simpleCart.each(function (item,x) {
						var counter = x+1,
							item_options = item.options(),
							optionCount = 0,
							send;
	
						// Basic item data
						data["item_name_" + counter] = item.get("name");
						data["quantity_" + counter] = item.quantity();
						data["amount_" + counter] = (item.price()*1).toFixed(2);
						data["item_number_" + counter] = item.get("item_number") || counter;


						// Add the options
						simpleCart.each(item_options, function (val,k,attr) {
							// Paypal limits us to 10 options
							if (k < 10) {
		
								// Check to see if we need to exclude this from checkout
								send = true;
								simpleCart.each(settings.excludeFromCheckout, function (field_name) {
									if (field_name === attr) { send = false; }
								});
								if (send) {
										optionCount += 1;
										data["on" + k + "_" + counter] = attr;
										data["os" + k + "_" + counter] = val;
								}
	
							}
						});

						data["option_index_"+ x] = Math.min(10, optionCount);
					});

					// Return the data for the checkout form
					return {
						  action	: action
						, method	: method
						, data		: data
					};

				},


				GoogleCheckout: function (opts) {
					// Account id is required
					if (!opts.merchantID) {
						return simpleCart.error("No merchant id provided for GoogleCheckout");
					}

					// Google only accepts USD and GBP
					if (simpleCart.currency().code !== "USD" && simpleCart.currency().code !== "GBP") {
						return simpleCart.error("Google Checkout only accepts USD and GBP");
					}

					// Build basic form options
					var data = {
							// TODO: better shipping support for this google
							  ship_method_name_1	: "Shipping"
							, ship_method_price_1	: simpleCart.shipping()
							, ship_method_currency_1: simpleCart.currency().code
							, _charset_				: ''
						},
						action = "https://checkout.google.com/api/checkout/v2/checkoutForm/Merchant/" + opts.merchantID,
						method = opts.method === "GET" ? "GET" : "POST";


					// Add items to data
					simpleCart.each(function (item,x) {
						var counter = x+1,
							options_list = [],
							send;
						data['item_name_' + counter]		= item.get('name');
						data['item_quantity_' + counter]	= item.quantity();
						data['item_price_' + counter]		= item.price();
						data['item_currency_ ' + counter]	= simpleCart.currency().code;
						data['item_tax_rate' + counter]		= item.get('taxRate') || simpleCart.taxRate();

						// Create array of extra options
						simpleCart.each(item.options(), function (val,x,attr) {
							// Check to see if we need to exclude this from checkout
							send = true;
							simpleCart.each(settings.excludeFromCheckout, function (field_name) {
								if (field_name === attr) { send = false; }
							});
							if (send) {
								options_list.push(attr + ": " + val);
							}
						});

						// Add the options to the description
						data['item_description_' + counter] = options_list.join(", ");
					});

					// Return the data for the checkout form
					return {
						  action	: action
						, method	: method
						, data		: data
					};


				},


				AmazonPayments: function (opts) {
					// Required options
					if (!opts.merchant_signature) {
						return simpleCart.error("No merchant signature provided for Amazon Payments");
					}
					if (!opts.merchant_id) {
						return simpleCart.error("No merchant id provided for Amazon Payments");
					}
					if (!opts.aws_access_key_id) {
						return simpleCart.error("No AWS access key id provided for Amazon Payments");
					}

					// Build basic form options
					var data = {
							  aws_access_key_id:	opts.aws_access_key_id, 
							  merchant_signature:	opts.merchant_signature, 
							  currency_code:		simpleCart.currency().code, 
							  tax_rate:				simpleCart.taxRate(), 
							  weight_unit:			opts.weight_unit || 'lb'
						},
						action = (opts.sandbox ? "https://sandbox.google.com/checkout/" : "https://checkout.google.com/") + "cws/v2/Merchant/" + opts.merchant_id + "/checkoutForm",
						method = opts.method === "GET" ? "GET" : "POST";

					// Add items to data
					simpleCart.each(function (item,x) {
						var counter = x+1,
							options_list = [];
						data['item_title_' + counter]			= item.get('name');
						data['item_quantity_' + counter]		= item.quantity();
						data['item_price_' + counter]			= item.price();
						data['item_sku_ ' + counter]			= item.get('sku') || item.id();
						data['item_merchant_id_' + counter]	= opts.merchant_id;
						if (item.get('weight')) {
							data['item_weight_' + counter]		= item.get('weight');
						}
						if (settings.shippingQuantityRate) {
							data['shipping_method_price_per_unit_rate_' + counter] = settings.shippingQuantityRate;
						}

						// Create array of extra options
						simpleCart.each(item.options(), function (val,x,attr) {
							// Check to see if we need to exclude this from checkout
							var send = true;
							simpleCart.each(settings.excludeFromCheckout, function (field_name) {
								if (field_name === attr) { send = false; }
							});
							if (send && attr !== 'weight' && attr !== 'tax') {
								options_list.push(attr + ": " + val);
							}
						});

						// Add the options to the description
						data['item_description_' + counter] = options_list.join(", ");
					});

					// Return the data for the checkout form
					return {
						  action	: action,
						  method	: method,
						  data		: data
					};

				},


				SendForm: function (opts) {
					// Url required
					if (!opts.url) {
						return simpleCart.error('URL required for SendForm Checkout');
					}

					// Build basic form options
					var data = {
							  currency	: simpleCart.currency().code,
							  shipping	: simpleCart.shipping(),
							  tax		: simpleCart.tax(),
							  taxRate	: simpleCart.taxRate(),
							  total 	: simpleCart.total(),
							  grandTotal: simpleCart.grandTotal(),
							  itemCount : simpleCart.quantity(),
							  items 	: []
						},
						action = opts.url,
						method = opts.method === "GET" ? "GET" : "POST";

					// Add items to data
					simpleCart.each(function (item,x) {
						var counter = x,
							options = {},
							send;

						// Create array of extra options
						simpleCart.each(item.options(), function (val,x,attr) {
							send = true;
							simpleCart.each(settings.excludeFromCheckout, function (field_name) {
								if (field_name === attr) { send = false; }
							});
							if (send) {
								options[attr] = val;
							}
						});

						data['items'][counter] = {
							id 		: item.get('id'),
							name 	: item.get('name'),
							quantity: item.quantity(),
							price 	: item.price(),
							sku 	: item.get('sku'),
							taxrate : item.get('taxrate'),
							options : options
						};

						x++;
					});


					// Check for return and success URLs in the options
					if (opts.success) {
						data['success'] = opts.success;
					}
					if (opts.cancel) {
						data.cancel_return = opts.cancel;
					}

					if (opts.extra_data) {
						data = simpleCart.extend(data,opts.extra_data);
					}

					// Return the data for the checkout form
					var str_json = JSON.stringify(data)
					return {
						  action	: action,
						  method	: method,
						  data		: {
						  	'result': "success",
						  	'data'	: str_json
						  }
					};
				}


			});


			// Event management
			eventFunctions = {

				// Bind a callback to an event
				bind: function (name, callback) {
					if (!isFunction(callback)) {
						return this;
					}

					if (!this._events) {
						this._events = {};
					}
					
					// Split by spaces to allow for multiple event bindings at once
					var eventNameList = name.split(/ +/);
					
					// Iterate through and bind each event
					simpleCart.each( eventNameList , function( eventName ){
						if (this._events[eventName] === true) {
							callback.apply(this);
						} else if (!isUndefined(this._events[eventName])) {
							this._events[eventName].push(callback);
						} else {
							this._events[eventName] = [callback];
						}
					});

					
					return this;
				},
				
				// Trigger event
				trigger: function (name, options) {
					var returnval = true,
						x,
						xlen;

					if (!this._events) {
						this._events = {};
					}
					if (!isUndefined(this._events[name]) && isFunction(this._events[name][0])) {
						for (x = 0, xlen = this._events[name].length; x < xlen; x += 1) {
							returnval = this._events[name][x].apply(this, (options || []));
						}
					}
					if (returnval === false) {
						return false;
					}
					return true;
				}

			};
			// Alias for bind
			eventFunctions.on = eventFunctions.bind;
			simpleCart.extend(eventFunctions);
			simpleCart.extend(simpleCart.Item._, eventFunctions);


			// Base simpleCart events in options
			baseEvents = {
				  beforeAdd				: null
				, afterAdd				: null
				, load					: null
				, beforeSave			: null
				, afterSave				: null
				, update				: null
				, ready					: null
				, checkoutSuccess		: null
				, checkoutFail			: null
				, beforeCheckout		: null
				, beforeRemove			: null
			};
			
			// Extend with base events
			simpleCart(baseEvents);

			// Bind settings to events
			simpleCart.each(baseEvents, function (val, x, name) {
				simpleCart.bind(name, function () {
					if (isFunction(settings[name])) {
						settings[name].apply(this, arguments);
					}
				});
			});

			// Formatting functions
			simpleCart.extend({
				toCurrency: function (number,opts) {
					var num = parseFloat(number),
						opt_input = opts || {},
						_opts = simpleCart.extend(simpleCart.extend({
							  symbol:		"$"
							, decimal:		"."
							, delimiter:	","
							, accuracy:		2
							, after: false
						}, simpleCart.currency()), opt_input),

						numParts = num.toFixed(_opts.accuracy).split("."),
						dec = numParts[1],
						ints = numParts[0];
			
					ints = simpleCart.chunk(ints.reverse(), 3).join(_opts.delimiter.reverse()).reverse();

					return	(!_opts.after ? _opts.symbol : "") +
							ints +
							(dec ? _opts.decimal + dec : "") +
							(_opts.after ? _opts.symbol : "");
	
				},


				// Break a string in blocks of size n
				chunk: function (str, n) {
					if (typeof n==='undefined') {
						n=2;
					}
					var result = str.match(new RegExp('.{1,' + n + '}','g'));
					return result || [];
				}

			});


			// Reverse string function
			String.prototype.reverse = function () {
				return this.split("").reverse().join("");
			};


			// Currency functions
			simpleCart.extend({
				currency: function (currency) {
					if (isString(currency) && !isUndefined(currencies[currency])) {
						settings.currency = currency;
					} else if (isObject(currency)) {
						currencies[currency.code] = currency;
						settings.currency = currency.code;
					} else {
						return currencies[settings.currency];
					}
				}
			});


			// View management
			simpleCart.extend({
				// Bind outlets to function
				bindOutlets: function (outlets) {
					simpleCart.each(outlets, function (callback, x, selector) {
						
						simpleCart.bind('update', function () {
							simpleCart.setOutlet("." + namespace + "_" + selector, callback);
						});
					});
				},

				// Set function return to outlet
				setOutlet: function (selector, func) {
					var val = func.call(simpleCart, selector);
					if (isObject(val) && val.el) {
						simpleCart.$(selector).html(' ').append(val);
					} else if (!isUndefined(val)) {
						simpleCart.$(selector).html(val);
					}
				},

				// Bind click events on inputs
				bindInputs: function (inputs) {
					simpleCart.each(inputs, function (info) {
						simpleCart.setInput("." + namespace + "_" + info.selector, info.event, info.callback);
					});
				},

				// Attach events to inputs	
				setInput: function (selector, event, func) {
					simpleCart.$(selector).live(event, func);
				}
			});		


			// Class for wrapping DOM selector shit
			simpleCart.ELEMENT = function (selector) {

				this.create(selector);
				this.selector = selector || null; // "#" + this.attr('id'); TODO: test length?
			};

			simpleCart.extend(selectorFunctions, {
				"jQuery": {
					passthrough: function (action, val) {
						if (isUndefined(val)) {
							return this.el[action]();
						}
						
						this.el[action](val);
						return this;
					},
					text: function (text) {
						return this.passthrough(_TEXT_, text);
					},
					html: function (html) {
						return this.passthrough(_HTML_, html);
					},
					val: function (val) {
						return this.passthrough("val", val);
					},
					append: function (item) {
						var target = item.el || item;
						this.el.append(target);
						return this;
					},
					attr: function (attr, val) {
						if (isUndefined(val)) {
							return this.el.attr(attr);
						}
						this.el.attr(attr, val);
						return this;
					},
					remove: function () {
						this.el.remove();
						return this;
					},
					addClass: function (klass) {
						this.el.addClass(klass);
						return this;
					},
					removeClass: function (klass) {
						this.el.removeClass(klass);
						return this;
					},
					each: function (callback) {
						return this.passthrough('each', callback);
					},
					click: function (callback) {
						return this.passthrough(_CLICK_, callback);
					},
					live: function (event, callback) {
						$engine(document).delegate(this.selector, event, callback);
						return this;
					},
					parent: function () {
						return simpleCart.$(this.el.parent());
					},
					find: function (selector) {
						return simpleCart.$(this.el.find(selector));
					},
					closest: function (selector) {
						return simpleCart.$(this.el.closest(selector));
					},
					tag: function () {
						return this.el[0].tagName;
					},
					descendants: function () {
						return simpleCart.$(this.el.find("*"));
					},
					submit: function() {
						return this.el.submit();
					},

					create: function (selector) {
						this.el = $engine(selector);
					}
				}
			});
			simpleCart.ELEMENT._ = simpleCart.ELEMENT.prototype;

			// Bind the DOM setup to the ready event
			simpleCart.ready(simpleCart.setupViewTool);

			// Bind the input and output events
			simpleCart.ready(function () {
				simpleCart.bindOutlets({
					total: function () {
						return simpleCart.toCurrency(simpleCart.total());
					},
					quantity: function () {
						return simpleCart.quantity();
					},
					items: function (selector) {
						simpleCart.writeCart(selector);
					},
					tax: function () {
						return simpleCart.toCurrency(simpleCart.tax());
					},
					taxRate: function () {
						return simpleCart.taxRate().toFixed();
					},
					shipping: function () {
						return simpleCart.toCurrency(simpleCart.shipping());
					},
					grandTotal: function () {
						return simpleCart.toCurrency(simpleCart.grandTotal());
					}
				});
				simpleCart.bindInputs([
					{	  selector: 'checkout'
						, event: 'click'
						, callback: function () {
							simpleCart.checkout();
						}
					},
					{	  selector: 'empty'
						, event: 'click'
						, callback: function () {
							simpleCart.empty();
						}
					},
					{	  selector: 'increment'
						, event: 'click'
						, callback: function () {
							simpleCart.find(simpleCart.$(this).closest('.itemRow').attr('id').split("_")[1]).increment();
							simpleCart.update();
						}
					},
					{	  selector: 'decrement'
						, event: 'click'
						, callback: function () {
							simpleCart.find(simpleCart.$(this).closest('.itemRow').attr('id').split("_")[1]).decrement();
							simpleCart.update();
						}
					},
					{	  selector: 'remove'
						, event: 'click'
						, callback: function () {
							simpleCart.find(simpleCart.$(this).closest('.itemRow').attr('id').split("_")[1]).remove();
						}
					},
					{	  selector: 'input'
						, event: 'change'
						, callback: function () {
							var $input = simpleCart.$(this),
								$parent = $input.parent(),
								classList = $parent.attr('class').split(" ");
							simpleCart.each(classList, function (klass) {
								if (klass.match(/item-.+/i)) {
									var field = klass.split("-")[1];
									simpleCart.find($parent.closest('.itemRow').attr('id').split("_")[1]).set(field,$input.val());
									simpleCart.update();
									return;
								}
							});
						}
					},
					{ selector: 'shelfItem .item_add',
						event: 'click',
						callback: function () {
							var $button = simpleCart.$(this),
								fields = {};

							$button.closest("." + namespace + "_shelfItem").descendants().each(function (x,item) {
								var $item = simpleCart.$(item);

								// Check to see if the class matches the item_[fieldname] pattern
								if ($item.attr("class") &&
									$item.attr("class").match(/item_.+/) &&
									!$item.attr('class').match(/item_add/)) {

									// Find the class name
									simpleCart.each($item.attr('class').split(' '), function (klass) {
										var attr,
											val,
											type;

										// Get the value or text depending on the tagName
										if (klass.match(/item_.+/)) {
											attr = klass.split("_")[1];
											val = "";
											switch($item.tag().toLowerCase()) {
												case "input":
												case "textarea":
												case "select":
													type = $item.attr("type");
													if (!type || ((type === "checkbox" || type === "radio") && $item.attr("checked")) || type === "text" || type === "hidden") {
														val = $item.val();
													}				
													break;
												case "img":
													val = $item.attr('src');
													break;
												default:
													val = $item.text();
													break;
											}

											if (val !== null && val !== "") {
												fields[attr.toLowerCase()] = fields[attr.toLowerCase()] ? fields[attr.toLowerCase()] + ", " +  val : val;
											}
										}
									});
								}
							});

							// Add the item
							simpleCart.add(fields);
						}
					}
				]);
			});


			// DOM READY
			// Global DOMContentLoaded
			if (document.addEventListener) {
				window.DOMContentLoaded = function () {
					document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
					simpleCart.init();
				};

			} else if (document.attachEvent) {
				window.DOMContentLoaded = function () {
					// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
					if (document.readyState === "complete") {
						document.detachEvent("onreadystatechange", DOMContentLoaded);
						simpleCart.init();
					}
				};
			}

			// The DOM ready check for Internet Explorer used from jQuery
			function doScrollCheck() {
				if (simpleCart.isReady) {
					return;
				}

				try {
					// If IE is used, use the trick by Diego Perini http://javascript.nwbox.com/IEContentLoaded/
					document.documentElement.doScroll("left");
				} catch (e) {
					setTimeout(doScrollCheck, 1);
					return;
				}

				// And execute any waiting functions
				simpleCart.init();
			}
			
			// Bind ready event used from jquery
			function sc_BindReady () {

				// Catch cases where $(document).ready() is called after the browser event has already occurred.
				if (document.readyState === "complete") {
					// Handle it asynchronously to allow scripts the opportunity to delay ready
					return setTimeout(simpleCart.init, 1);
				}

				// Mozilla, Opera and webkit nightlies currently support this event
				if (document.addEventListener) {
					// Use the handy event callback
					document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

					// A fallback to window.onload, that will always work
					window.addEventListener("load", simpleCart.init, false);

				// If IE event model is used
				} else if (document.attachEvent) {
					// Ensure firing before onload, maybe late but safe also for iframes
					document.attachEvent("onreadystatechange", DOMContentLoaded);

					// A fallback to window.onload, that will always work
					window.attachEvent("onload", simpleCart.init);

					// If IE and not a frame continually check to see if the document is ready
					var toplevel = false;

					try {
						toplevel = window.frameElement === null;
					} catch (e) {}

					if (document.documentElement.doScroll && toplevel) {
						doScrollCheck();
					}
				}
			}

			// Bind the ready event
			sc_BindReady();

			return simpleCart;
		};


	window.simpleCart = generateSimpleCart();

}(window, document));

// JSON
var JSON;JSON||(JSON={});
(function () {function k(a) {return a<10?"0"+a:a}function o(a) {p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function (a) {var c=r[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function l(a,j) {var c,d,h,m,g=e,f,b=j[a];b&&typeof b==="object"&&typeof b.toJSON==="function"&&(b=b.toJSON(a));typeof i==="function"&&(b=i.call(j,a,b));switch(typeof b) {case "string":return o(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);case "object":if (!b)return"null";
e += n;f=[];if (Object.prototype.toString.apply(b)==="[object Array]") {m=b.length;for (c=0;c<m;c += 1)f[c]=l(c,b)||"null";h=f.length===0?"[]":e?"[\n"+e+f.join(",\n"+e)+"\n"+g+"]":"["+f.join(",")+"]";e=g;return h}if (i&&typeof i==="object") {m=i.length;for (c=0;c<m;c += 1)typeof i[c]==="string"&&(d=i[c],(h=l(d,b))&&f.push(o(d)+(e?": ":":")+h))}else for (d in b)Object.prototype.hasOwnProperty.call(b,d)&&(h=l(d,b))&&f.push(o(d)+(e?": ":":")+h);h=f.length===0?"{}":e?"{\n"+e+f.join(",\n"+e)+"\n"+g+"}":"{"+f.join(",")+
"}";e=g;return h}}if (typeof Date.prototype.toJSON!=="function")Date.prototype.toJSON=function () {return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+k(this.getUTCMonth()+1)+"-"+k(this.getUTCDate())+"T"+k(this.getUTCHours())+":"+k(this.getUTCMinutes())+":"+k(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function () {return this.valueOf()};var q=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
p=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,e,n,r={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},i;if (typeof JSON.stringify!=="function")JSON.stringify=function (a,j,c) {var d;n=e="";if (typeof c==="number")for (d=0;d<c;d += 1)n += " ";else typeof c==="string"&&(n=c);if ((i=j)&&typeof j!=="function"&&(typeof j!=="object"||typeof j.length!=="number"))throw Error("JSON.stringify");return l("",
{"":a})};if (typeof JSON.parse!=="function")JSON.parse=function (a,e) {function c(a,d) {var g,f,b=a[d];if (b&&typeof b==="object")for (g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=c(b,g),f!==void 0?b[g]=f:delete b[g]);return e.call(a,d,b)}var d,a=String(a);q.lastIndex=0;q.test(a)&&(a=a.replace(q,function (a) {return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return d=eval("("+a+")"),typeof e==="function"?c({"":d},""):d;throw new SyntaxError("JSON.parse");}})();


// HTML5 Local Storage Support
(function () {if (!this.localStorage)if (this.globalStorage)try {this.localStorage=this.globalStorage}catch(e) {}else{var a=document.createElement("div");a.style.display="none";document.getElementsByTagName("head")[0].appendChild(a);if (a.addBehavior) {a.addBehavior("#default#userdata");var d=this.localStorage={length:0,setItem:function (b,d) {a.load("localStorage");b=c(b);a.getAttribute(b)||this.length++;a.setAttribute(b,d);a.save("localStorage")},getItem:function (b) {a.load("localStorage");b=c(b);return a.getAttribute(b)},
removeItem:function (b) {a.load("localStorage");b=c(b);a.removeAttribute(b);a.save("localStorage");this.length=0},clear:function () {a.load("localStorage");for (var b=0;attr=a.XMLDocument.documentElement.attributes[b++];)a.removeAttribute(attr.name);a.save("localStorage");this.length=0},key:function (b) {a.load("localStorage");return a.XMLDocument.documentElement.attributes[b]}},c=function (a) {return a.replace(/[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g,
"-")};a.load("localStorage");d.length=a.XMLDocument.documentElement.attributes.length}}})();
