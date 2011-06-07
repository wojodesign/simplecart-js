

	
	
	module('update view');
	test("cart row input event property" , function(){
		var info = ['size' , 'input'],
			item = {
				  id: 'c9'
				, size: 'small'
			},
			output = simpleCart.createCartRow( info , item , null );
			
		same( output , "<input type=\"text\" value=\"small\" onchange=\"simpleCart.items['c9'].set('size' , this.value);\" />", 'onchange event has expected format' );
	});
	
	
	
	
	
	module('price handling');
	test('non number prices interpretted as 0', function(){
		same( simpleCart.valueToCurrencyString( 'wers' ) , simpleCart.valueToCurrencyString( '0' ) , 'NaN converted to 0 for output');
		
	});
	
	
	module("saving/removing items");
	test('items not overwritten because of duplicate id', function(){
		simpleCart.empty();
		simpleCart.nextId=99;
		simpleCart.add("name=Bob","price=13.00");
		simpleCart.nextId=99;
		simpleCart.add("name=Joe","price=13.00");
		same( simpleCart.items['c99'].name , "Bob" , "Item not overwritten" );
	});
	
	
	test('return item after adding to cart', function(){
		
		var item = simpleCart.add("name=Jeff","price=14.00");
		same( item.name , "Jeff" , "Name is the same" );
		same( simpleCart.items[ item.id ] , item , "Item accessible by id in simpleCart.items" );
		item.remove();
		same( simpleCart.items[ item.id ] , undefined , "Item removed properly with pointer");
		
		
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
		
		same( simpleCart.print("Price") , "Boom" , "Humanized name translated");
		same( simpleCart.print("price") , "Boom" , "Lower case name translated");
		same( simpleCart.print("Boom")  , "Boom" , "No translation returns input");
		
		
	});