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

	filesList.push('recipe_libs/thorax.js!order');

	//initialize the app object
	window.app = {};

	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	// Подключаем необходимые транзиты.
	this.useTransits('jquery', 'location', options);

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