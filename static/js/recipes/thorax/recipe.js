// version: 0.1.1
// -------------
//
// __История версий:__
// 
// * `0.1.1` - Внесение правок для работы с новым api marrow.
//
// * `0.1.0` - Создан минимальный необходимый функционал рецепта.
//
// Проверяем существует ли неймспейс приложения. Если нет, то создаем его.
window.WebApp || (window.WebApp = {});

// Добавляем метод который будет делать проверки и возвращать список зависимостей рецепта.
window.WebApp.Dependencies = function(window) {
	var filesList = [];

	if (!window.$) {
		filesList.push('recipe_libs/jquery.js');
	}

	if (!window.Handlebars) {
		filesList.push('system/handlebars.min.js');
	}

	if (!window._) {
		filesList.push('recipe_libs/underscore.js');
	}
	filesList.push('recipe_libs/backbone.js', 'recipe_libs/thorax.js');

	//initialize the app object
	window.app = {};

	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	// Подключаем необходимые транзиты.
	this.useTransits('jquery', 'location', options);

	// Подготавливаем _DOM_ элемент который будет выступать в качестве контейнера для веб-приложения.
	this.container = $(options.loadOptions.containerSelector || 'body');

	// Метод инициалзиации рантайма веб-приложения.
	this.init = function(initData, registerAfterInitHandler) {
		// Регистрируем обработчик, который будет вызван по завершению инициализации приложения.
		registerAfterInitHandler(this.afterInit);

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