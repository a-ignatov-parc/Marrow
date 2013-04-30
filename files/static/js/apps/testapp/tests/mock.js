$.mockJSON.random = false;
$.mockJSON(/Get\/Alternatives/, {
	'Success': true,
	'Response|5-10': [{
		'image': 'static/img/photos/product_1.jpg',
		'price|1000-9000': 0
	}]
});