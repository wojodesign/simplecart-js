

	
	
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
	
	
	module("saving items");
	test('items not overwritten because of duplicate id', function(){
		simpleCart.empty();
		simpleCart.nextId=99;
		simpleCart.add("name=Bob","price=13.00");
		simpleCart.nextId=99;
		simpleCart.add("name=Joe","price=13.00");
		same( simpleCart.items['c99'].name , "Bob" , "Item not overwritten" );
	});
	
