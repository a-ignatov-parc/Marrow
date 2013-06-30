window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			window.ENTER_KEY = 13;

			// Grab the text from the templates we created above
			// 
			// Сделано так, чтобы не править конфиг гранта, так как все шаблоны по умолчанию 
			// компилируются в неймспейс App.Templates.
			Thorax.templates = this.Templates;

			// Kick things off by creating the **App**.
			var view = new Thorax.Views.app({
				collection: window.app.Todos
			});

			// Вставляем приложение в страницу используя заранее указанный контейнер.
			view.appendTo(this.container);

			// Запускаем роутинг бекбона.
			Backbone.history.start();
		}
	}, options);
};