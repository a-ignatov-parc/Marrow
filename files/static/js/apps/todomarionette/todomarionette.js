window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			// start the TodoMVC app (defined in js/TodoMVC.js)
			TodoMVC.start();
		}
	}, options);
};