// version: 0.1.3
// -------------
// 
// __История версий:__  
// 
// * `0.1.3` - Теперь в транзиты обязательно нужно передавать объект опций.
// 
// * `0.1.2` - Добавлен транзит селекторов из песочницы на главный объект `window`.
// 
// * `0.1.1` - Добавлен вызов метода `afterInit`.
// 
// * `0.1.0` - Создан минимальный необходимый функционал рецепта.
// 
// Проверяем существует ли неймспейс приложения. Если нет, то создаем его.
window.WebApp || (window.WebApp = {});

// Добавляем метод который будет делать проверки и возвращать список зависимостей рецепта.
window.WebApp.Dependencies = function(window) {
	var filesList = [];

	if (!window.$) {
		filesList.push('system/jquery/jquery.min.js!order');
	}

	if (!window._) {
		filesList.push('system/lodash.min.js!order');
	}
	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	// Подключаем необходимые транзиты.
	this.useTransits('jquery', options);

	// Подготавливаем _DOM_ элемент который будет выступать в качестве контейнера для веб-приложения
	this.container = $(options.loadOptions.containerSelector || 'body');

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