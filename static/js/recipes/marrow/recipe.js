/*global
	Handlebars
*/
// version: 1.2.8
// -------------
// 
// __История версий:__  
// 
// * `1.2.8` - Теперь в транзиты обязательно нужно передавать объект опций.
// 
// * `1.2.7` - Добавлен двух стороний транзит урлов из песочницы на главный объект `window`.
// 
// * `1.2.6` - Все методы связанные с бандлами и работой `backbone` вынесены в 
// файл `recipe.sugar.js`.
// 
// * `1.2.5` - Добавлен транзит селекторов из песочницы на главный объект `window`.
// 
// * `1.2.4` - Класс приложения теперь стал рецептом и определяет как себя будет вести марроу через 
// список зависимостей и воркфлоу инициализации.
// 
// * `1.2.3` - Исправлен код получения контейнера приложения.
// 
// * `1.2.2` - Убрана предкомпиляции шаблонов так как они теперь будут заранее скомпилированы.
// 
// * `1.2.1` - Исправлена ошибка с передачей объекта с данными в метод создания бандлов.
// 
// * `1.2.0` - Класс приложения переделан для правильной работы в полноценной песочнице.
// 
// Проверяем существует ли неймспейс приложения. Если нет, то создаем его.
window.WebApp || (window.WebApp = {});

// Добавляем метод который будет делать проверки и возвращать список зависимостей рецепта.
window.WebApp.Dependencies = function(window) {
	var filesList = [];

	if (!window.$) {
		filesList.push('system/jquery/jquery.min.js');
	}

	if (!window._) {
		filesList.push('system/lodash.min.js');
	}
	filesList.push('recipe_libs/backbone.min.js', 'recipe_libs/backbone.sync.js', 'recipe/recipe.sugar.js');

	if (!window.Handlebars) {
		filesList.push('system/handlebars.min.js');
	}
	return filesList;
};

// Объявляем конструктор рецепта.
window.WebApp.Recipe = function(webapp, window, sandbox, options) {
	// Кешируем регулярку для использования в методе `core.getHashUrl()`
	var getHashUrlRegex = /^[!\/]{0,2}(?:([^!\/\d]+)?\/?)(.*)?$/;

	// Создание глобальных коллекция для хранения вью, роутеров, моделей и коллекций
	this.Views = {};
	this.Models = {};
	this.Routers = {};
	this.Helpers = [];
	this.Templates = {};
	this.Collections = {};

	// Объявление начальных значений для переменных.
	this.view = null;
	this.router = null;
	this.aliases = null;

	// Регистрируем ссылку на `Backbone` для быстрого доступа.
	this.Backbone = sandbox.Backbone;

	// Добавляем "сахара" в `Backbone` с помощью фреймворка `Marrow`.
	webapp.Marrow(this.Backbone);

	// Если существует коллекции ссылок, то добавляем ссылки на прототипы сущностей бэкбона для 
	// упрощения написания кода.
	if (this._globalLinks) {
		_.extend(this._globalLinks, {
			ViewProto: this.Backbone.View.prototype,
			ModelProto: this.Backbone.Model.prototype,
			CollectionProto: this.Backbone.Collection.prototype
		});
	}

	// Подключаем необходимые транзиты.
	this.useTransits('jquery', 'location', options);

	// Подготавливаем _DOM_ элемент который будет выступать в качестве контейнера для веб-приложения.
	this.container = $(options.loadOptions.containerSelector || 'body');

	// Метод инициалзиации рантайма веб-приложения.
	this.init = function(initData) {
		var path = '/',
			helper;

		// Проверяем создан ли кастомный обработчик ошибок
		if (this.errorHandler && typeof(this.errorHandler) === 'function') {
			// Если не создан, то записываем его на прямую
			if (!sandbox.onerror) {
				sandbox.onerror = this.bind(this.errorHandler, this);
			} else {
				// Если есть уже какой-то обработчик то мы делаем обертку которая при
				// вызове сначала вызовет старый обработчик с переданными параметрами
				// и лишь потом будет вызван наш обработчик
				var oldHandler = sandbox.onerror;

				sandbox.onerror = this.bind(function() {
					oldHandler.apply(sandbox, arguments);
					this.errorHandler.apply(this, arguments);
				}, this);
			}
		}

		// Проверяем если `this.beforeInit` функция, то делаем его вызов с параметрами переданными 
		// в метод `this.init()`
		if (typeof(this.beforeInit) === 'function') {
			this.beforeInit.apply(this, arguments);
		}

		// Если в настройках загрузчкика указан кастомный пусть запуска вебприложения то записываем его 
		// в переменную `path` для дальнейшей проверки
		try {
			if (this.loadOptions.locations.customPath) {
				path = this.loadOptions.locations.customPath;
			}
		} catch(e) {}

		// Регистрируем короткую ссылку на колекцию псевдонимов (алиасов)
		this.aliases = this.links();

		// Регистрируем загруженные хелперы
		for (var i = 0, length = this.Helpers.length; i < length; i++) {
			helper = this.Helpers[i];

			if (typeof(helper) === 'function') {
				helper(Handlebars, {
					hosts: this.hosts,
					templates: this.Templates,
					processHelperData: this.processHelperData
				});
			}
		}

		// Если у нас существует конструктор роутинга, то расширяем его прототип
		if (this.Routers.Workspace) {
			// Прописываем главной вью ссылку на объект веб-приложения
			this.Routers.Workspace.prototype.core = this;
			this.Routers.Workspace.prototype.__bind = this.bind;
			this.Routers.Workspace.prototype.__links = this.bind(this.links, this);
			this.Routers.Workspace.prototype.__aliases = this.aliases;

			// Инициализируем инстанс роутинга, сохраняя его в переменную `this.router` для быстрого доступа
			this.router = new this.Routers.Workspace();

			// Вызываем метод для создания бандлов используемых в веб-приложении передавая аргументом 
			// данные для бутстрапа
			try {
				this.router.createBundles(initData || {});
			} catch(e) {
				// Если упало создание какого-то бандла то об этом точно стоит знать
				throw(e);
			}
		}

		// Если у нас существует конструктор главной вью, то расширяем его прототип
		if (this.Views.Workspace) {
			// Прописываем главной вью ссылку на объект веб-приложения
			this.Views.Workspace.prototype.core = this;
			this.Views.Workspace.prototype.__bind = this.bind;
			this.Views.Workspace.prototype.__links = this.bind(this.links, this);
			this.Views.Workspace.prototype.__aliases = this.aliases;

			// Инициализируем инстанс главной вью, сохраняя его в переменную `this.view` для быстрого доступа
			this.view = new this.Views.Workspace();
		}

		// Если в главной вью есть метод `view.setListeners()` который навешивает глобальный события, то 
		// выполняем его.
		this.view && this.view.setListeners && this.view.setListeners();

		// Передаем в бекбон инстанс jquery, который располагается в песочнице
		this.Backbone.setDomLibrary(this.sandbox.$);

		// Проверяем если `this.afterInit` функция, то делаем его вызов с параметрами переданными 
		// в метод `this.init()`
		if (typeof(this.afterInit) === 'function') {
			this.afterInit.apply(this, arguments);
		}

		// Инициализируем ядро backbone.js
		this.Backbone.history.start({
			root: path,
			core: this
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

	// Метод который получает текущий роутинг и выдает его в более удобном формате для работы 
	// разбивая на:
	// 
	// * `section` - Основная часть роута
	// 
	// * `parameters` - Остальные параметры присутсвующие в урле. Чаще всего служебная информация 
	// для вьюх
	this.getHashUrl = function() {
		var regData = this.Backbone.History.started && getHashUrlRegex.exec(this.Backbone.history.getFragment()) || [];

		return {
			section: regData[1],
			parameters: regData[2]
		};
	};

	// Метод создающий объект-пустышку для проксирования абсолютно всех событий с переданного 
	// источника данных.  
	// Может потребоваться когда на один источник данных подписывается несколько обработчиков на 
	// одно и то же событие и во избежания отписывания всех обработчиков при отписывания одного из 
	// них стоит использовать проксирование событий, так как кадый обработчик будет навешен на свой 
	// собственный источник и никак не влиять на других.
	this.createEventProxy = function(dataSource) {
		var proxy = _.extend({}, this.Backbone.Events);

		// Подписываем прокси-объект как обработчик всех событий источника данных
		dataSource.on('all', function() {
			proxy.trigger.apply(proxy, arguments);
		});
		return proxy;
	};
};