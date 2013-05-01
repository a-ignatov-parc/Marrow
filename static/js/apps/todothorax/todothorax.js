window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			window.ENTER_KEY = 13;

			// Grab the text from the templates we created above
			// Сделано так, чтобы не править конфиг гранта
			Thorax.templates = this.Templates;

			// Kick things off by creating the **App**.
			var view = new Thorax.Views.app({
				collection: window.app.Todos
			});

			view.appendTo('body');
			Backbone.history.start();
		}
	}, options);
};