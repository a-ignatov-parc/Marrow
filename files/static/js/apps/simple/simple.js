window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			alert('App is ready!');
		}
	}, options);
};