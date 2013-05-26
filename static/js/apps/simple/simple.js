window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			$('body').prepend('<span>App is ready!</span>');
		}
	}, options);
};