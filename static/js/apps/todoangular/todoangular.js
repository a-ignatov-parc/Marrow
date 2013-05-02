window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			/**
			 * The main TodoMVC app module
			 *
			 * @type {angular.Module}
			 */
			var todomvc = angular.module('todomvc', []);
		}
	}, options);
};