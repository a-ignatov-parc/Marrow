window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			$('body').text('App is ready!');
		}
	}, options);
};