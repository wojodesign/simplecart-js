simpleCart.ready(function(){
	if( !QUnit.urlParams.storage ){
		simpleCart.empty();
		simpleCart.add("name=Cool T-shirt","price=25.00","quantity=1","thumb=http://www.google.com/intl/en_com/images/srpr/logo3w.png");
	
		for( var x = 0; x<100; x++ ){
			simpleCart.add("name=Cool item #" + x , "price=1" );
		}
	
	
		var mark = document.location.href.match(/\?/) ? "&" : "?";
		document.location.href = document.location.href + mark + "storage=true";
	} else { 


	module('simpleCart-storage');
	test("proper loading after page refesh", function(){


		deepEqual( simpleCart.quantity , 101 , "sc quantity loaded properly" );
		deepEqual( simpleCart.total , 125 , "sc total loaded properly" );

		var item = simpleCart.find({name:"Cool T-shirt"})[0];

		deepEqual( item.quantity , 1 , "item quantity loaded properly" );
		deepEqual( item.name , "Cool T-shirt" , "item name loaded properly" );
		deepEqual( item.price , 25 , "item price loaded properly" );
		deepEqual( item.thumb , "http://www.google.com/intl/en_com/images/srpr/logo3w.png" , "storage irregular option works" );


	});





	module('simpleCart core functions');
	test("simpleCart.chunk() function works", function(){
		
		var str = "11111" + "11111" + "11111" + "11111" + "11111",
			array = [ "11111" , "11111" , "11111" , "11111" , "11111" ];
			test = simpleCart.chunk( str , 5 );
			
		deepEqual( test , array , "chunked array properly into 5 piece chunks");
		
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
		deepEqual( test_names() , "bobjoejeff" , "items iterated properly");
		
		
		
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
	
	
	module('update view');
	test("cart row input event property" , function(){
		var info = ['size' , 'input'],
			item = {
				  id: 'c9'
				, size: 'small'
			},
			output = simpleCart.createCartRow( info , item , null );
			
		deepEqual( output , "<input type=\"text\" value=\"small\" onchange=\"simpleCart.items['c9'].set('size' , this.value);\" />", 'onchange event has expected format' );
	});
	
	
	
	
	
	module('price handling');
	test('non number prices interpretted as 0', function(){
		deepEqual( simpleCart.valueToCurrencyString( 'wers' ) , simpleCart.valueToCurrencyString( '0' ) , 'NaN converted to 0 for output');
		
	});
	
	
	module("saving/removing items");
	test('items not overwritten because of duplicate id', function(){
		simpleCart.empty();
		simpleCart.nextId=99;
		simpleCart.add("name=Bob","price=13.00");
		simpleCart.nextId=99;
		simpleCart.add("name=Joe","price=13.00");
		deepEqual( simpleCart.items['c99'].name , "Bob" , "Item not overwritten" );
	});
	
	
	test('return item after adding to cart', function(){
		
		var item = simpleCart.add("name=Jeff","price=14.00");
		deepEqual( item.name , "Jeff" , "Name is the same" );
		deepEqual( simpleCart.items[ item.id ] , item , "Item accessible by id in simpleCart.items" );
		item.remove();
		deepEqual( simpleCart.items[ item.id ] , undefined , "Item removed properly with pointer");
		
	});
	
	test('special characters removed from new item', function(){
		
		var item = simpleCart.add("name=Bill~","price=1422.00");
		deepEqual( item.name , "Bill" , "~ removed from new item" );
		item.set( 'name' , "Nick=");
		deepEqual( item.name , "Nick" , "= removed from item update" );
		item.set( 'name' , "John~");
		deepEqual( item.name , "John" , "~ removed from item update" );
		
	});
	
	
	test('duplicate items increase quantity', function(){
		
		
		var before = 0,
			before_q,
			before_iq,
			after = 0,
		 	item;
		
		item = simpleCart.add("name=Jorge","price=1.00");
		
		simpleCart.each(function(item,x){
			before++;
		});
		before_iq = item.quantity;
		before_q = simpleCart.quantity;
		
		item = simpleCart.add("name=Jorge","price=1.00");
		
		simpleCart.each(function(item,x){
			after++;
		});
		
		deepEqual( before , after , "individual item count remains the same" );
		deepEqual( simpleCart.quantity , before_q+1, "cart quantity increased" );
		deepEqual( item.quantity , before_iq+1, "item quantity increased" );
	});
	
	
	module("updating items");
	test('updates to quantity using item.set() with number value work', function(){
		//simpleCart.empty();
		var item = simpleCart.add("name=Cool Tshirt","price=132.00");
		item.set( 'quantity' , 30 );
		deepEqual( item.quantity , 30 , "Quantity with number properly updated" );
	});
	
	test('updates to quantity using item.set() with string value work', function(){
		//simpleCart.empty();
		var item = simpleCart.add("name=Cool Tshirt","price=132.00");
		item.set( 'quantity' , "30" );
		deepEqual( item.quantity , 30 , "Quantity with string properly updated" );
	});
	
	

	
	module("language");
	test("change language", function(){
		simpleCart.ln.fake = {
			  quantity: "Bleh"
			, price: "Boom"
			, total: "Pow"
			, decrement: "Crack"
			, increment: "Click"
			, remove: "Snap"
			, tax: "Crash"
			, shipping: "Zoom"
			, image: "Zap"
		};
		
		simpleCart.language = "fake";
		simpleCart.update();
		
		deepEqual( simpleCart.print("Price") , "Boom" , "Humanized name translated");
		deepEqual( simpleCart.print("price") , "Boom" , "Lower case name translated");
		deepEqual( simpleCart.print("Boom")  , "Boom" , "No translation returns input");
		
		
	});
	
	simpleCart.empty();
	simpleCart.add("name=Cool T-shirt","price=25.00","quantity=1","thumb=http://www.google.com/intl/en_com/images/srpr/logo3w.png");
	
	for( var x = 0; x<100; x++ ){
		simpleCart.add("name=Cool item #" + x , "price=1" );
	}

}

});
	