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
		filesList.push('system/jquery/jquery.min.js!order');
	}

	if (!window._) {
		filesList.push('system/lodash.min.js!order');
	}
	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	var initQueue = [];

	// Подключаем необходимые транзиты.
	this.useTransits('jquery', 'location', options);

	// Из-за того что ангулар инициализируется сразу как только загрузится необходимо перед его 
	// загрузкой инициализировать транзиты иначе ангулар ней выйдет из песочницы.
	options._loader('recipe_libs/angular.js', function() {
		// Если существует очередь дожидающаяся загрузки анугуляра, то выполняем методы в порядке 
		// добавления в очередь.
		if (initQueue.length) {
			for (var i = 0, length = initQueue.length; i < length; i++) {
				initQueue[i]();
			}
		}
	}, YES);

	// Метод инициалзиации рантайма веб-приложения.
	this.init = function(initData, registerAfterInitHandler) {
		// Регистрируем обработчик, который будет вызван по завершению инициализации приложения.
		registerAfterInitHandler(function() {
			// Проверяем существует ли метод `this.afterInit` иначе записываем в переменную пустую функцию.
			var afterInit = typeof(this.afterInit) === 'function' ? this.afterInit : function() {};

			// Из-за особенностей инициализации ангуляра проверяем доступен ли он.  
			// Если да, то сразу вызываем метод `afterInit`, если же нет, то добавляем вызов в очередь.
			if (window.angular) {
				afterInit.apply(this, arguments);
			} else {
				initQueue.push((function(context, args) {
					return function() {
						afterInit.apply(context, args);
					}
				})(this, arguments));
			}
		});

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