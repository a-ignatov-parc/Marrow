window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			// Инициализируем приложение
			window.todomvc = angular.module('todomvc', []);
		},

		// Из-за особенностей инициализации приложений на ангуляре все зависимости необходимо загружать 
		// после инициализации неймспейса. По этому файлы приложения помещены в секцию `defered` списка 
		// файлов.  
		// Если необходимо узнать о завершении загрузки этих файлов, то объявляем метод `afterDefered`.
		afterDefered: function() {
			console.info('App is ready!');
		}
	}, options);
};