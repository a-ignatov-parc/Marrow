test('Проверка существования класса ядра необходимого для инициализации', function() {
	equal(typeof(window.WebApp), 'object', 'Объект WebApp не инициализирован');
	equal(typeof(window.WebApp.Core), 'function', 'Класс WebApp.Core не инициализирован');
	equal(typeof(window.WebApp.Core.prototype.constructor), 'function', 'У класс WebApp.Core не указан конструктор');
	equal(window.WebApp.Core.prototype.constructor, window.WebApp.Core, 'Конструктор класса WebApp.Core не соответсвует самому себе');
	equal(typeof(window.WebApp.Core.registerTransit), 'function', 'Метод регистрации транзитов не существует');
});

test('Проверка правильности регистрации транзитов', function() {
	var transitHandler = function() {},
		unbindTransitHandler = function() {},
		calcCount = function(target) {
			var count = 0;

			for (var key in target) {
				if (target.hasOwnProperty(key) && target[key] != null) {
					count++;
				}
			}
			return count;
		};

	equal(window.WebApp.Core.prototype.constructor._transits, null, 'По умолчанию список транзитов не должен существовать');

	// Регистрируем первый транзит
	window.WebApp.Core.registerTransit('testTransit', transitHandler);

	equal(typeof(window.WebApp.Core.prototype.constructor._transits), 'object', 'После регистрации первого транзита коллекция транзитов не создана');

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 1, 'После регистрации первого транзита колличество транзитов в коллекции должно быть равно 1');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].bind, transitHandler, 'Транзит не зарегестрирован или зарегестрирован не с тем обработчиком');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].unbind, null, 'У транзита не должен быть регистрирован обработчик отключения');
	equal(window.WebApp.Core.prototype.constructor._transits['testTransit'], null, 'Имена транзитов должны регистрироваться в маленьком регистре');

	// Регистрируем другой транзит с обработчиком отключения
	window.WebApp.Core.registerTransit('testTransitBindUnbind', transitHandler, unbindTransitHandler);

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 2, 'После регистрации первого транзита колличество транзитов в коллекции должно быть равно 2');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransitbindunbind'].bind, transitHandler, 'Транзит не зарегестрирован или зарегестрирован не с тем обработчиком');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransitbindunbind'].unbind, unbindTransitHandler, 'У транзита не регистрирован обработчик отключения');

	// Повторно пытаемся зарегестрировать транзит с таким же именем, но уже с другим обработчиком
	window.WebApp.Core.registerTransit('testTransit', function() {});

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 2, 'Транзиты с одинаковыми именами повторно не регистрируются');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].bind, transitHandler, 'Обработчики транзитов при попытке повторной регистрации не изменяются');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].unbind, null, 'Обработчики транзитов при попытке повторной регистрации не добавляется');

	// Повторно пытаемся зарегестрировать транзит с таким же именем, с другим обработчиком и с 
	// обработчиком отключения
	window.WebApp.Core.registerTransit('testTransit', function() {}, function() {});

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 2, 'Транзиты с одинаковыми именами повторно не регистрируются');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].bind, transitHandler, 'Обработчики транзитов при попытке повторной регистрации не изменяются');
	equal(window.WebApp.Core.prototype.constructor._transits['testtransit'].unbind, null, 'Обработчики транзитов при попытке повторной регистрации не добавляется');

	// Регистрируем транзит с другим именем
	window.WebApp.Core.registerTransit('testTransit2', transitHandler);

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 3, 'После регистрации транзита с новым именем колличество транзитов в коллекции должно быть равно 3');

	// Регистрируем транзит с именем равное числу
	window.WebApp.Core.registerTransit(123, transitHandler);

	// Регистрируем транзит с именем равное обработчику
	window.WebApp.Core.registerTransit(transitHandler);

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 3, 'Имя транзита может быть равно только строке');

	// Регистрируем транзит с обработчиков равное числу
	window.WebApp.Core.registerTransit('testTransitNum', 123);

	// Регистрируем транзит с обработчиков равное булеану
	window.WebApp.Core.registerTransit('testTransitTrue', true);
	window.WebApp.Core.registerTransit('testTransitFalse', false);

	equal(calcCount(window.WebApp.Core.prototype.constructor._transits), 3, 'Обработчик транзита может быть равен только функции');

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});

test('Проверка правильности активации транзитов', function() {
	var transitHandler = function(window, sandbox, options) {
			equal(window, testWindow, 'Ссылка на объект window основной страницы не совпадает с переданной при создании инстанса');
			equal(sandbox, testSandbox, 'Ссылка на объект sandbox основной страницы не совпадает с переданной при создании инстанса');
			equal(options, testOptions, 'Объект параметров не совпадает с тем что был передан при активации транзита');
		},
		testWindow = window,
		testSandbox = window,
		testOptions = {
			a: 1
		},
		coreInstance;

	window.WebApp.Core.registerTransit('testTransit', transitHandler, transitHandler);
	window.WebApp.Core.registerTransit('changeVar', function(window, sandbox, options) {
		options.test = true;
	}, function(window, sandbox, options) {
		delete options.test;
	});

	// Создаем тестовый инстанс приложения
	coreInstance = new window.WebApp.Core(window.WebApp, testWindow, testSandbox);

	equal(typeof(coreInstance.useTransits), 'function', 'В инстансе приложения не существует метода активации транзитов');
	equal(typeof(coreInstance.removeTransits), 'function', 'В инстансе приложения не существует метода отключения транзитов');

	// Включаем транзит с именем `testTransit`
	coreInstance.useTransits('testTransit', testOptions);

	// Отключаем транзит с именем `testTransit`
	coreInstance.removeTransits('testTransit', testOptions);

	equal(testOptions.test, null, 'атрибут test не должен существовать в объекте testOptions');

	// Включаем транзит с именем `changeVar`
	coreInstance.useTransits('changeVar', testOptions);

	equal(testOptions.test, true, 'атрибут test должен быть равен true');

	// Отключаем транзит с именем `changeVar`
	coreInstance.removeTransits('changeVar', testOptions);

	equal(testOptions.test, null, 'атрибут test не должен существовать в объекте testOptions');

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});

asyncTest('Проверка правильности активации нескольких транзитов', 7, function() {
	var transitHandler = function() {
			ok(true, 'handler1 has been triggered');
		},
		coreInstance;

	window.WebApp.Core.registerTransit('testTransit', transitHandler, transitHandler);
	window.WebApp.Core.registerTransit('testTransit2', transitHandler, transitHandler);
	window.WebApp.Core.registerTransit('testTransit3', transitHandler, transitHandler);
	window.WebApp.Core.registerTransit('testTransit4', transitHandler);

	// Создаем тестовый инстанс приложения
	coreInstance = new window.WebApp.Core(window.WebApp, window, window);

	start();
	coreInstance.useTransits('testTransit', 'testTransit2', 'testTransit3', 'testTransit4', {});
	coreInstance.removeTransits('testTransit', {});
	coreInstance.removeTransits('testTransit2', {});
	coreInstance.removeTransits('testTransit3', 'testTransit4', {});

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});

asyncTest('Регистр написания имени транзита не учитывается при его вызове', 4, function() {
	var transitHandler = function(window, sandbox, options) {
			ok(true, 'handler has been triggered');
		},
		coreInstance;

	window.WebApp.Core.registerTransit('testTransit', transitHandler);

	// Создаем тестовый инстанс приложения
	coreInstance = new window.WebApp.Core(window.WebApp, window, window);

	start();
	coreInstance.useTransits('testTransit', {});
	coreInstance.useTransits('TESTTRANSIT', {});
	coreInstance.useTransits('testtransit', {});
	coreInstance.useTransits('TeStTrAnSiT', {});

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});

asyncTest('Вызов не существующего транзита', 0, function() {
	// Создаем тестовый инстанс приложения
	var coreInstance = new window.WebApp.Core(window.WebApp, window, window);

	start();
	coreInstance.useTransits('testTransit', {});

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});

asyncTest('Вызов не существующего транзита', 0, function() {
	// Создаем тестовый инстанс приложения
	var coreInstance;

	window.WebApp.Core.registerTransit('testTransit', function() {
		ok(true, 'handler has been triggered');
	});

	// Создаем тестовый инстанс приложения
	coreInstance = new window.WebApp.Core(window.WebApp, window, window);

	start();
	coreInstance.useTransits('test', {});

	// Возвращаем в первоначальное состояние все объекты после прохождения набора тестов
	delete window.WebApp.Core.prototype.constructor._transits;
});