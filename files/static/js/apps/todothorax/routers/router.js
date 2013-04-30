/*global Backbone*/
(function () {
	'use strict';

	// Todo Router
	// ----------

	var Router = Backbone.Router.extend({
		routes: {
			'': 'setFilter',
			':filter': 'setFilter'
		},

		setFilter: function (param) {
			// Set the current filter to be used
			window.app.TodoFilter = param ? param.trim().replace(/^\//, '') : '';
			// Thorax listens for a `filter` event which will
			// force the collection to re-filter
			window.app.Todos.trigger('filter');
		}
	});

	window.app.TodoRouter = new Router();

}());
