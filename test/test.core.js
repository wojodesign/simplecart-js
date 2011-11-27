
if( !QUnit.urlParams.storage ){
	simpleCart.empty();
	simpleCart.add({
		name: "Cool T-shirt",
		price: 25
	});
	var mark = document.location.href.match(/\?/) ? "&" : "?";
	document.location.href = document.location.href + mark + "storage=true";
}


module('simpleCart-storage');
test("proper loading after page refesh", function(){

	var item = simpleCart.find({})[0];
	
	same( item.quantity() , 1 , "item quantity loaded properly" );
	same( item.get('name') , "Cool T-shirt" , "item name loaded properly" );
	same( item.price() , 25 , "item price loaded properly" );
	same( simpleCart.quantity() , 1 , "sc quantity loaded properly" );
	same( simpleCart.total() , 25 , "sc total loaded properly" );
	
	
});




module('simpleCart core functions');
test("adding and removing items", function(){
	
	simpleCart.empty();
	
	same( simpleCart.quantity() , 0 , "Quantity correct after one item added" );
	
	var item = simpleCart.add({
		name: "Cool T-shirt",
		price: 25
	});
	
	same( simpleCart.quantity() , 1 , "Quantity correct after one item added" );
	same( simpleCart.total() , 25 , "Total correct after one item added" );
	same( item.get( 'price' ) , 25 , "Price is correctly saved" );
	same( item.get( 'name' ) , "Cool T-shirt", "Name is correctly saved" );
});

test("editing items", function(){	
	
	simpleCart.empty();
	
	var item = simpleCart.add({
		name: "Cool T-shirt",
		price: 25
	});
	
	item.set( "name" , "Really Cool Shorts" );
	item.set("quantity" , 2 );
	
	same( item.get( "name" ) , "Really Cool Shorts" , "Name attribute updated with .set" );
	same( item.get( "quantity" ) , 2 , "quantity updated with .set" );
	
	item.quantity(2);
	
	same( item.quantity() , 2 , "Setting quantity with item.quantity() works" );
	
	item.increment();
	
	same( simpleCart.quantity() , 3 , "Quantity is two after item incremented");
	same( item.quantity() , 3 , "Item quantity incremented to 2" );
	same( simpleCart.total() , 75 , "Total increased properly after incremented item");
	
	item.increment( 5 );
	
	same( item.quantity() , 8 , "Quantity incremented with larger value");
	
	item.remove();
	
	same( simpleCart.quantity() , 0 , "Quantity correct after item removed" );
	same( simpleCart.total() , 0 , "Total correct after item removed" );
	
});


	test("simpleCart.chunk() function works", function(){
		
		var str = "11111" + "11111" + "11111" + "11111" + "11111",
			array = [ "11111" , "11111" , "11111" , "11111" , "11111" ];
			test = simpleCart.chunk( str , 5 );
			
		same( test , array , "chunked array properly into 5 piece chunks");
		
	});
	
	test("simpleCart.toCurrency() function works", function(){
		
		var number = 2234.23;
		
		same( simpleCart.toCurrency( number ), "&#36;2,234.23" , "Currency Base Case");
		
		same( simpleCart.toCurrency( number , { delimiter: " " }) ,"&#36;2 234.23" ,  "Changing Delimiter");

		same( simpleCart.toCurrency( number , { decimal: ","  }) ,  "&#36;2,234,23" , "Changing decimal delimiter");

		same(  simpleCart.toCurrency( number , { symbol: "!"  }) , "!2,234.23" , "Changing currency symbol");
		
		same( simpleCart.toCurrency( number , { accuracy: 1  }) , "&#36;2,234.2" ,  "Changing decimal accuracy");
		
		same( simpleCart.toCurrency( number , { after: true  }) ,  "2,234.23&#36;" , "Changing symbol location");
		
		same( simpleCart.toCurrency( number , { symbol: "", accuracy:0, delimiter:"" }) , "2234", "Long hand toInt string" );
		
		
	});
	
	
	test("simpleCart.each() function works", function(){
		
		var myarray = ['bob' , 'joe' , function bill(){} , 'jeff' ];
		
		function test_bill(){
			var test = true;
			simpleCart.each( myarray , function(item,x){
				if( x === 3 ){
					test = false;
				}
			});
			return test;
		}
		
		function test_names(){
			var ms = "";
			simpleCart.each( myarray , function(item,x){
				ms += item;
			});
			return ms;
		}
		
		ok( test_bill() , "function dismissed in each" );
		same( test_names() , "bobjoejeff" , "items iterated properly");
		
		
		
		function test_cart_items(){
			var items = simpleCart.items,
				pass = true;
				
			simpleCart.each(function(item,x){
				if( items[item.id] !== item ){
					pass = fail;
				}
			});
			
			return pass;
		}
	
		ok( test_cart_items() , "simpleCart items iterated correctly with .each");
	
	});
	
	asyncTest("simpleCart.ready() works", function(){
		simpleCart.ready(function(){
			ok(true);
			start();
		});
	});
	
	

	test("simpleCart.copy() function works", function(){
			
		var sc_demo = simpleCart.copy('sc_demo');
		sc_demo.add({ name:"bob",price:34,size:"big"});
		
	});
	
	
	
	
	module('tax and shipping');
	test("shipping works", function(){
			
		simpleCart.empty();
		simpleCart({
			taxRate: 0.06 ,
			shippingFlatRate: 20
		});
		
		simpleCart.add({name: "bob" , price: 2 });
		
		same( simpleCart.taxRate() , 0.06 , "Tax Rate saved properly");
		same( simpleCart.tax() , 0.06*2 , "Tax Cost Calculated properly");
		same( simpleCart.shipping() , 20 , "Flat Rate shipping works");
		
		
		simpleCart({
			shippingQuantityRate: 3
		});
		
		same( simpleCart.shipping() , 20 + 1*3 , "Shipping Quantity Rate works");
		
		simpleCart({
			shippingTotalRate: 0.1
		});
		
		
		same( simpleCart.shipping() , 20 + 1*3 + 0.1*2 , "Shipping Quantity Rate works");
		
		
		simpleCart({
			shippingFlatRate: 0 ,
			shippingQuantityRate: 0 ,
			shippingTotalRate: 0 ,
			taxRate: 0 ,
			shippingCustom: function(){
				return 45;
			}
		});
		
		simpleCart.empty();
		same( simpleCart.shipping() ,  45 , "Custom Shipping works");
		
		simpleCart.add({name:"cool",price:1,shipping:45});
		same( simpleCart.shipping() ,  90 , "item shipping field works");
		
		simpleCart.Item._.shipping = function(){
			if( this.get('name') === 'cool'){
				return 5;
			} else {
				return 1;
			}
		};
		
		simpleCart.empty();
		simpleCart.add({name:'cool',price:2});
		simpleCart.add({name:'bob',price:3});
		simpleCart.add({name:'weird',price:3});
		simpleCart({
			shippingCustom: null
		});
		same( simpleCart.shipping() ,  7 , "Item shipping prototype function works");
		
	});
	test("tax works", function(){
		
		simpleCart.empty();
		simpleCart({
			taxRate: 0.06 
		});

		simpleCart.add({name: "bob" , price: 2 });

		same( simpleCart.taxRate() , 0.06 , "Tax Rate saved properly");
		same( simpleCart.tax() , 0.06*2 , "Tax Cost Calculated properly");
		
		
		simpleCart({
			taxRate: 0 
		});
		simpleCart.empty();
		simpleCart.add({name:"cool",price:2,taxRate:0.05});
		same( simpleCart.tax() ,  2*0.05 , "Individual item tax rate works");
		
		
		simpleCart.empty();
		simpleCart.add({name:"cool",price:2,tax:1});
		same( simpleCart.tax() ,  1 , "Individual item tax cost works");
		
		simpleCart.empty();
		simpleCart.add({name:"cool",price:2,tax:function(){
			return this.price()*0.1;
		}});
		same( simpleCart.tax() , 0.2, "individual tax cost function works");
		
		simpleCart.empty()
		
	});
	
	
	module('simpleCart.find');
	test("simpleCart.find() function works", function(){
			
		simpleCart.empty();
		var bob = simpleCart.add({name: "bob" , price: 2 , color:'blue' , size: 6 }),
			joe = simpleCart.add({name: "joe" , price: 3 , color:'orange' , size: 3 }),
			jeff = simpleCart.add({name: "jeff" , price: 4 , color:'blue' , size: 4 }),
			bill = simpleCart.add({name: "bill" , price: 5 , color:'red' , size: 5 }),
		
		 	orange_items = simpleCart.find({ color: 'orange' }),
			expensive = simpleCart.find({ price: '>=4' }),
			small = simpleCart.find({ size: '<5' }),
			bob_search = simpleCart.find({ name: "bob" }),
			blue_and_big = simpleCart.find({ color: 'blue', size: '>4' });
			
			
		
			
		
		same( simpleCart.find(bob.id()).id() , bob.id() , "Searching with id works");
		same( orange_items[0].id() , joe.id() , "Searching with string = val works");
		same( expensive[0].id() , jeff.id(), "Searching >= works");
		same( small[0].id() , joe.id(), "Searching < works");
		same( bob_search[0].id() , bob.id(), "Searching by name works");
		same( blue_and_big[0].id() , bob.id(), "Searching on multiple indices works");
				
	});
	
	module('simpleCart UI updates');
	test("basic outlets work", function(){
	
		var item = simpleCart.add({
			name: "Cool T-shirt",
			price: 25
		});

		document.getElementById('test_id').innerHTML = simpleCart.quantity();
		same( document.getElementById('simpleCart_quantity').innerHTML , document.getElementById('test_id').innerHTML , "quantity outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.total() );
		same( document.getElementById('simpleCart_total').innerHTML , document.getElementById('test_id').innerHTML, "total outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.taxRate().toFixed();
		same( document.getElementById('simpleCart_taxRate').innerHTML , document.getElementById('test_id').innerHTML , "taxRate outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.tax() );
		same( document.getElementById('simpleCart_tax').innerHTML , document.getElementById('test_id').innerHTML , "tax outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.shipping() );
		same( document.getElementById('simpleCart_shipping').innerHTML , document.getElementById('test_id').innerHTML , "shipping outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.grandTotal() );
		same( document.getElementById('simpleCart_grandTotal').innerHTML , document.getElementById('test_id').innerHTML , "grand total outlet works" );
		
		
		
	});
	
	module('simpleCart UI updates');
	test("basic outlets work", function(){
	
		var item = simpleCart.add({
			name: "Cool T-shirt",
			price: 25
		});

		document.getElementById('test_id').innerHTML = simpleCart.quantity();
		same( document.getElementById('simpleCart_quantity').innerHTML , document.getElementById('test_id').innerHTML , "quantity outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.total() );
		same( document.getElementById('simpleCart_total').innerHTML , document.getElementById('test_id').innerHTML, "total outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.taxRate().toFixed();
		same( document.getElementById('simpleCart_taxRate').innerHTML , document.getElementById('test_id').innerHTML , "taxRate outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.tax() );
		same( document.getElementById('simpleCart_tax').innerHTML , document.getElementById('test_id').innerHTML , "tax outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.shipping() );
		same( document.getElementById('simpleCart_shipping').innerHTML , document.getElementById('test_id').innerHTML , "shipping outlet works" );
		
		document.getElementById('test_id').innerHTML = simpleCart.toCurrency( simpleCart.grandTotal() );
		same( document.getElementById('simpleCart_grandTotal').innerHTML , document.getElementById('test_id').innerHTML , "grand total outlet works" );
				
	});
	
	
	module('simpleCart cart views');
	test("basic cart views", function(){
		
		simpleCart({
			cartColumns	: [
				  { attr: "name" , label: "Name" }
				, { view: "image" , attr: "thumb" }
				, { attr: "price" , label: "Price", view: 'currency' }
				, { view: "decrement" , label: false }
				, { attr: "quantity" , label: "Qty" }
				, { view: "increment" , label: false }
				, { attr: "total" , label: "SubTotal", view: 'currency' }
				, { view: "remove" , text: "Remove" , label: false }
			]
		});
		
		simpleCart.empty();
	
		var item = simpleCart.add({
			name: "The Letter E", 
			thumb: "e.png" ,
			price: 34
		});
		
		same( simpleCart.$("#cartItem_" + item.id() + " .item-thumb img").attr("src") , "e.png" , "Image view works properly");
		
		
	});

	
	
// just incase we refresh ;)
	simpleCart.empty();
	simpleCart.add({
		name: "Cool T-shirt",
		price: 25
	});	
