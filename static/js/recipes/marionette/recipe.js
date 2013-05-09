// version: 0.1.1
// -------------
// 
// __История версий:__  
// 
// * `0.1.1` - Теперь в транзиты обязательно нужно передавать объект опций.
// 
// * `0.1.0` - Создан минимальный необходимый функционал рецепта.
// 
// Проверяем существует ли неймспейс приложения. Если нет, то создаем его.
window.WebApp || (window.WebApp = {});

// Добавляем метод который будет делать проверки и возвращать список зависимостей рецепта.
window.WebApp.Dependencies = function(window) {
	var filesList = [];

	if (!window.$) {
		filesList.push('recipe_libs/jquery.js!order');
	}

	if (!window._) {
		// lodash doesn't support _#chain which backbone.localStorage requires.
		// https://github.com/addyosmani/todomvc/pull/481
		filesList.push('recipe_libs/underscore.js!order');
	}
	filesList.push('recipe_libs/backbone.js!order', 'recipe_libs/backbone.marionette.js!order');
	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	// Подключаем необходимые транзиты.
	this.useTransits('jquery', 'location', options);

	// Метод инициалзиации рантайма веб-приложения.
	this.init = function(initData) {
		// Проверяем если `this.afterInit` функция, то делаем его вызов с параметрами переданными 
		// в метод `this.init()`
		if (typeof(this.afterInit) === 'function') {
			this.afterInit.apply(this, arguments);
		}

		// Если включен режим дебага, то возвращаем весь объект веб-приложения
		if (this.debugMode && !this.strictMode) {
			return this;
		}

		// По умолчанию возвращаем версию библиотеки _Marrow_
		return {
			version: this.version
		};
	};
};