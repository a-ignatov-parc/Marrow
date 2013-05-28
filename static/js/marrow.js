/*global
	_
*/
// version: 0.3.6
// -------------
// 
// __История версий:__  
// 
// * `0.3.6` - Все транзиты вынесены в отдельные модули и создана система подключения и запуска 
// любого кол-ва подключаемых транзитов. Сделан багофикс класса `core.Perf`.
// 
// * `0.3.5` - Исправлена работа транзита селекторов в последних версиях jquery.
// 
// * `0.3.4` - В дефолтные параметры объекта `hosts` добавлена ссылка на папку `html`.
// 
// * `0.3.3` - Добавлена возможность отключать использование транзита через опции приложения.
// 
// * `0.3.2` - Исправлена ошибка когда при инициализации не синхронизировались роуты.
// 
// * `0.3.1` - Добавлен метод для трансляции урлов с песочницы на главную страницу и обратно.
// 
// * `0.3.0` - Из `core.js` вынесены все методы связанные с `backbone.js` в `core.sugar.js`, а так 
// же сделан рефакторин остальных методов.
// 
// * `0.2.5` - Расширен функционал форматирования даты в методе `dateUTC`.
// 
// * `0.2.4` - Реализован метод создающий транзит селекторов из песочницы на главный объект 
// `window`.
// 
// * `0.2.3` - Добавлены дефолтные переменные для приложения + максимально вынесены методы 
// завязанные на рецепт.
// 
// * `0.2.2` - Исправлена ошибка в методе `dateUTC` если в него не передана дата.
// 
// * `0.2.1` - Удален метод компиляции шаблонов так как они теперь будут заранее скомпилированы.
// 
// * `0.2.0` - Класс ядра переделан для правильной работы в полноценной песочнице.
// 
// Объявляем лексические сокращения для `true` и `false`
window.YES = !0;
window.NO = !1;
window.WebApp || (window.WebApp = {});
window.WebApp.Core = function(webapp, window, sandbox) {
	// Объявление переменных.
	var splitReg = /[:.\-\s\/]+/,

		// Метод реализующий подключение и отключение переданных транзитов с переданным набором 
		// параметров.
		setTransits = function() {
			var args = Array.prototype.slice.call(arguments),
				method = args.shift(),
				options = args.pop(),
				name;

			if (!this.constructor._transits) {
				console.error('No transits registered in collection!');
				return;
			}

			if (typeof(options) !== 'object') {
				throw 'Last argument should be options object!';
			}

			if (!args.length) {
				console.info('No transits found in arguments. Skiping...');
			}

			for (var i = 0, length = args.length; i < length; i++) {
				if (typeof(args[i]) === 'string') {
					name = args[i].toLowerCase();

					if (this.constructor._transits[name]) {
						if (typeof(this.constructor._transits[name][method]) === 'function') {
							this.constructor._transits[name][method].call(this, window, sandbox, options);
						} else {
							console.warn('No "' + method + '" method for transit with name "' + args[i] + '" were found! Skipping...');
						}
					} else {
						console.warn('No transit with name "' + args[i] + '" were found! Skipping...');
					}
				} else {
					console.warn('Transit name should be string! Skipping...', args[i]);
				}
			}
		};

	// Версия фреймворка `Marrow`.
	this.version = '0.3.6-188';

	// Ссылка для получения из песочницы объекта `window` основного документа в котором 
	// инициализируется веб-приложение.
	this.global = window;
	this.debugMode = NO;
	this.rootHost = null;
	this.strictMode = YES;
	this.sandbox = sandbox;

	// Создаем объект `hosts` со значениями по умолчанию.
	this.hosts = {
		init: '/',
		request: '/',
		js: '/js',
		img: '/img',
		html: '/html',
		css: '/styles/css'
	};

	// Объявляем коллекцию алиасов
	this._globalLinks = {};

	// Список зарегистрирвоанных в системе бандлов
	this.list = [];

	// Метод подключающий в песочницу транзиты чьи имена были переданы в аргементах функции
	// 
	// __Пример:__  
	// 
	//         core.useTransits('jquery', 'location', options);
	this.useTransits = function() {
		return setTransits.apply(this, ['bind'].concat(Array.prototype.slice.call(arguments)));
	};

	// Метод отключающий в песочницу транзиты чьи имена были переданы в аргементах функции
	// 
	// __Пример:__  
	// 
	//         core.removeTransits('location', options);
	this.removeTransits = function() {
		return setTransits.apply(this, ['unbind'].concat(Array.prototype.slice.call(arguments)));
	};

	// Метод, который будет позволять замерять производительность выполнения скриптов.
	this.Perf = function() {
		var startTime,
			method,
			methods = ['now', 'webkitNow', 'msNow', 'mozNow'],
			perfNow = function() {
				if (method) {
					return window.performance[method]();
				} else {
					return Date.now();
				}
			};

		for (var i = 0, length = methods.length; i < length; i++) {
			if (methods[i] && methods[i] in window.performance) {
				method = methods[i];
				break;
			}
		}

		this.start = function() {
			startTime = perfNow();
		};

		this.end = function() {
			if (!startTime) {
				return 0;
			}
			return perfNow() - startTime;
		};
	};

	// Метод который генерирует уникальный 5 значный `ID`
	this.generateId = function() {
		return (Math.floor(Math.random() * 10000) + '00000').slice(0, 5);
	};

	// Метод который получает значение хеша урла.  
	// Если не передан никакой аргумент, то получается значение хеша песочницы, если передан объект 
	// `window`, то получается знвчение хеша которое установлено у переданного объекта.
	this.getLocationHash = function(window) {
		var windowLocation = window ? window.location : sandbox.location,
			hash = windowLocation.href.match(/#(.*)$/);

		return hash ? hash[1] : '';
	};

	// Метод который полностью подменяет контекст вызова у переданной функции на тот что был передан 
	// в параметрах.  
	// Более быстрая альтернатива универсальному `fn.bind(context)` (http://jsperf.com/bind-experiment-2)
	// 
	// __Пример:__  
	// 
	//         var a = {
	//             handler: core.bind(fn, context)
	//         }
	this.bind = function(fn, context) {
		context || (context = window);

		if (typeof(fn) === 'function') {
			return function() {
				return fn.apply(context, arguments);
			};
		}
		return NO;
	};

	// Метод который позволяет собрать новый объект из одного или более объектов на основе карты 
	// атрибутов.  
	// В результате получаем объект в который попали только те поля, что были указаны в карте с 
	// именами цказанными в качестве значений атрибутов карты.
	// 
	// __Пример:__  
	// 
	//         this.core.aliasMerge({
	//             _a: 'a',
	//             _b: 'b',
	//             _c: 'c',
	//             _d: 'targetId',
	//             _e: 'relatedItems',
	//         }, {
	//             a: 1,
	//             b: 2,
	//             c: 3,
	//         }, {
	//             b: 22,
	//             targetId: 4
	//         });
	// __Результат:__  
	// 
	//         {
	//             _a: 1,
	//             _b: 22,
	//             _c: 3,
	//             _d: 4
	//         }
	this.aliasMerge = function(aliasMap) {
		var map = {},
			reverseMap = {},
			sources = [].slice.call(arguments, 1),
			source = sources.shift(),
			key;

		for (key in aliasMap) {
			if (aliasMap.hasOwnProperty(key) && typeof(aliasMap[key]) === 'string') {
				reverseMap[aliasMap[key]] = key;
			}
		}

		for (;source;) {
			for (key in source) {
				if (source.hasOwnProperty(key) && reverseMap[key] && source[key]) {
					map[reverseMap[key]] = source[key];
				}
			}
			source = sources.shift();
		}
		return map;
	};

	// Метод который регистрирует и возвращает псевдонимы в которых указанны ссылки на переданные 
	// объекты.
	// 
	// __Пример:__  
	// 
	// 1. Получение коллекции всех ссылок. Имеет аналог в виде `core.aliases`
	// 
	//         core.links();
	// 
	// 1. Получение ссылки зарегистрированной по передаваемому псвдониму.
	// 
	//         core.links('aliasName');
	// 
	// 1. Регистрация ссылки на объект/переменную/фукцию под переданным псевдонимом.
	// 
	//         core.links('aliasName', link);
	// 
	// 1. Обновление значения алиаса без изменения ссылки на объект.
	// 
	//         core.links('aliasName', newValue, true);
	this.links = function(aliasName, link, update) {
		// Если коллекции ссылок нету, то создаем ее.
		this._globalLinks || (this._globalLinks = {});

		var hasName = !!aliasName,
			hasLink = link != null;

		if (hasLink && hasName) {
			if (typeof(aliasName) === 'string') {
				if (!this._globalLinks[aliasName]) {
					this._globalLinks[aliasName] = link;
				} else if (update) {
					_.extend(this._globalLinks[aliasName], link);
				} else {
					return NO;
				}
			} else {
				return NO;
			}
		} else if (hasName) {
			return this._globalLinks[aliasName];
		} else if (hasLink) {
			return NO;
		}
		return this._globalLinks;
	};

	// Метод который позволяет создать _jQuery DOM_ элемент с переданным набором параметров.  
	// Работает быстрее чем `$('<div>')`.
	// 
	// __Пример:__  
	// 
	//         core.domBuilder('div', {
	//             id: 'id',
	//             name: 'name',
	//             class: 'className',
	//             html: 'text'
	//         });
	this.domBuilder = function(tagName, options) {
		if (typeof(jQuery) !== 'function') {
			throw 'This method require jQuery to be defined!';
		}
		var domEl = [document.createElement(tagName)];

		$.fn.attr.call(domEl, options, YES);
		return $.merge($(), domEl);
	};

	// Инициализируем инстанс системы `pub/sub` событий.
	this.observatory = new webapp.Observatory();

	// Самый быстрый метод глубокого клонирования.  
	// Не поддерживает ссылки, функции и объекты с методами
	this.clone = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	};

	// Метод добавляющий в начале числа нули равное указанному значеню разрядов
	this.formatDate = function(digit, count, dummy) {
		dummy = [];
		count || (count = 2);
		dummy.length = count;

		return (dummy.join('0') + digit).slice(-count);
	};

	// Метод позволяющи работать с датой в формате timestamp форматирую ее для дальнейшей работы.  
	// Принимает следующие параметры которые влияют на результат выполнения метода:
	// 
	// * `time` - (_object_) Время в формате _timestamp_ или в строковом формате который может распарсить 
	// `Date.parse()` (см. http://www.w3schools.com/jsref/jsref_parse.asp). Если параметр не передан, 
	// то будет использовать время на момент вызова метода.
	// 
	// * `format` - (_string_) Формат в котором необходимо вернуть указанное время.  
	// __Пример:__ `dd.mm.HH`  
	// __Результат:__ `28.1.2011`
	// 
	// * `asArray` - (_bool_) Аргумент указывающий на то в каком виде возвращать отформатированую дату. 
	// Если он положителен то вернется массив, если нет то строка.
	// 
	// Если не передан аргумент `format` или он является _falsy_ значением, то методом будет возвращен 
	// объект в котором содержиться разобранная дата по параметрам
	this.dateUTC = function(time, format, asArray) {
		var date,
			d;

		// Задаем переданное время
		if (time) {
			d = new Date(time);
		}

		// Если время небыло задано или был передан не правильный формат, то создаем объект текущей даты
		if (!d || isNaN(d.getTime())) {
			d = new Date();
		}
		date = {
			wd: d.getUTCDay(),
			dd: d.getUTCDate(),
			h: d.getUTCHours(),
			mm: d.getUTCMonth(),
			m: d.getUTCMinutes(),
			s: d.getUTCSeconds(),
			hh: d.getUTCFullYear(),
			ms: d.getUTCMilliseconds(),
			WD: this.formatDate(d.getUTCDay()),
			DD: this.formatDate(d.getUTCDate()),
			H: this.formatDate(d.getUTCHours()),
			M: this.formatDate(d.getUTCMinutes()),
			S: this.formatDate(d.getUTCSeconds()),
			MM: this.formatDate(d.getUTCMonth() + 1),
			HH: this.formatDate(d.getUTCFullYear(), 4),
			MS: this.formatDate(d.getUTCMilliseconds(), 3),
			timestamp: d.valueOf()
		};

		if (format) {
			var partialDate = format.split(splitReg);

			if (partialDate && partialDate.length) {
				for (var i = 0, length = partialDate.length; i < length; i++) {
					if (date[partialDate[i]]) {
						if (asArray) {
							partialDate[i] = date[partialDate[i]];
						} else {
							format = format.replace(partialDate[i], date[partialDate[i]]);
						}
					}
				}
			}

			if (asArray) {
				return partialDate;
			} else {
				return format;
			}
		}
		return date;
	};

	// Метод, который преобразует объект в массив.  
	// В массив добавляется элемент формата:
	// 
	//         {
	//             name: key,
	//             value: object[key]
	//         }
	// 
	// Если будет передан массив, то он веренется без изменения.
	this.toArray = function(data, options) {
		var returnData = [],
			item;

		options = _.extend({
			name: 'name',
			value: 'value'
		}, options);

		if (data) {
			if (data.length) {
				returnData = data.slice(0);
			} else {
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						item = returnData[returnData.push({}) - 1];
						item[options.name] = key;
						item[options.value] = data[key];
					}
				}
			}
		}
		return returnData;
	};

	// Метод, который преобразует массив в объект.  
	// Массив должен приходить формата:
	// 
	//         [{
	//             name: 'a',
	//             value: 1
	//         },{
	//             name: 'b',
	//             value: 2
	//         }]
	// 
	// На выходе получим:
	// 
	//         {
	//             a: 1,
	//             b: 2
	//         }
	// 
	// Если будет передан объект, то он вернется без обработки.
	this.toObject = function(data) {
		var returnData = {};

		if (data) {
			if (data.push && data.length) {
				for (var i = 0, length = data.length, item, itemData; i < length; i++) {
					item = data[i];
					itemData = returnData[item.name];

					if (itemData) {
						if (!itemData.push) {
							returnData[item.name] = [itemData];
						}
						returnData[item.name].push(item.value);
					} else {
						returnData[item.name] = item.value;
					}
				}
			} else {
				returnData = data;
			}
		}
		return returnData;
	};

	// Метод для создания и получения куков.  
	// Если в качестве аргумента передан массив, то метод вернет значения переданных значений в том 
	// же порядке в каком они находились в массиве.  
	// Если передан объект со значения, то метод создаст переменные с названиями как ключи полей и 
	// значениями что указанны в этих полях
	// 
	// __Пример:__  
	// 
	// 1. Запись значений в куки
	// 
	//         core.cookie({
	//             firstName: 'Jon',
	//             lastName: 'Doe'
	//         });
	// __Результат:__ `['Jon', 'Doe']`
	// 
	// 1. Получение значений из кук
	// 
	//         core.cookie(['firstName', 'lastName']);
	// __Результат:__ `['Jon', 'Doe']`
	// 
	// 1. Получение значений из кук
	// 
	//         core.cookie('firstName, lastName');
	// __Результат:__ `['Jon', 'Doe']`
	// 
	// 1. Получение значений из кук
	// 
	//         core.cookie('firstName, lastName, middleName');
	// __Результат:__ `['Jon', 'Doe', null]`
	// 
	// 1. Удаление значения из кук
	// 
	//         core.cookie({
	//             lastName: null,
	//             middleName: false
	//         });
	//         core.cookie('firstName, lastName, middleName');
	// __Результат:__ `['Jon', null, false]`
	// 
	// 1. Запись значений в куки только на открытую сессию (после закрытия окна кука будет удалена)
	// 
	//         core.cookie({
	//             firstName: 'Jon',
	//             lastName: 'Doe'
	//         }, true);
	// 
	// 1. Запись в куку объекта
	// 
	//         core.cookie({
	//             city: {
	//                 name: 'Samara',
	//                 location: []
	//             }
	//         });
	// __Результат:__ `[{name: 'Samara', location: []}]`
	this.cookie = function(params, isSessionCookie) {
		var get = function(name) {
				var reg = new RegExp(name.replace(/\s+/, '') + '=([^;]*)', 'gi'),
					result = reg.exec(document.cookie);

				return result && JSON.parse(result[1]);
			},
			addedParams = [];

		// Если параметр не передан, то возвращаем весь объект кук
		if (!params) {
			return document.cookie;
		}

		// Обработка на случай если аргумент передали в качестве строки
		if (typeof(params) === 'string') {
			params = params.split(',');
		}

		if (params instanceof Array) {
			var list = [];

			for (var i = 0, length = params.length; i < length; i++) {
				list.push(get(params[i]));
			}
			return list;
		} else {
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					var cookieArr = [key + '=' + JSON.stringify(params[key]), 'path=/', 'expires=Mon, 01-Jan-' + (params[key] == null ? '1900' : '2100') + ' 00:00:00 GMT'];

					// Если у нас кука должна быть сессионной, то мы удаляем дату `expires`
					if (isSessionCookie) {
						cookieArr.pop();
					}
					addedParams.push(key);

					// Записываем значение куки
					document.cookie = cookieArr.join(';');
				}
			}
			return arguments.callee(addedParams);
		}
	};
};

// Указываем ссылку на конструктор
window.WebApp.Core.prototype = {
	constructor: window.WebApp.Core
};

window.WebApp.Core.registerTransit = function(name, bindHandler, unbindHandler) {
	this._transits || (this._transits = {});

	if (typeof(name) === 'string' && typeof(bindHandler) === 'function') {
		name = name.toLowerCase();

		if (this._transits[name]) {
			console.error('Transit with name: ' + name + ' was already registered.');
		} else {
			this._transits[name] = {
				bind: bindHandler,
				unbind: unbindHandler
			};
		}
	} else {
		console.error('Wrong arguments type! Should be "string" + "function" but get "' + typeof(name) + '" and "' + typeof(bindHandler) + '"');
	}
};
// version: 0.1.3
// -------------
// 
// __История версий:__  
// 
// * `0.1.3` - Исправлена ошибка строгого сравнения хостовых объектов из песочницы и основной 
// страницы.
// 
// * `0.1.2` - Добавлен хак для получения ссылки на `jQuery` объект объекта `window` песочницы.
// 
// * `0.1.1` - Небольшой рефакторинг и проверка существование `jQuery`, как зависимость для 
// работы + рефакторинг кода.
// 
// * `0.1.0` - Транзит для селекторов `jQuery` вынесен в отдельный файл.
// 
// Транзит который создает прозрачное прокидывание селекторов `jQuery` с объекта `window` из 
// песочницы на объект `window` главный страницы.  
// После запуска данного транзита всем выборкам селекторов сделанные с помощью `jQuery` будут 
// добавляться контекст поиска в виде `window.document` страницы в которой создана песочница.  
// Если в качестве селекторов будут переданы следующие DOM элементы: `window`, `document`, `head`, 
// `body` они будут заменены на соответсвующие DOM элементы главной страницы.  
(function(webapp) {
	webapp.Core.registerTransit('jquery', function(window, sandbox, options) {
		// Добавлена возможность отключать использование транзита через опции приложения.
		try {
			if (options.loadOptions.disableTransits.jquery) {
				return;
			}
		} catch(e) {
			console.error(e);
		}

		// Проверка на существование `jQuery`
		if (typeof(jQuery) !== 'function') {
			console.error('This transit require jQuery to be defined!');
			return;
		}

		// Переопределяем метод `getComputedStyle` в песочнице чтоб он ссылался на соответсвующий метод в 
		// основном документе иначе в jquery версии 1.8.x и старше будут не правильно определятся 
		// видимость элементов и некоторые другие стили.
		if (sandbox.getComputedStyle && window.getComputedStyle) {
			sandbox.getComputedStyle = function() {
				return window.getComputedStyle.apply(window, arguments);
			};
		}

		// Делаем обертку над `jQuery.fn.init` для возможносит прозрачного переброса селекторов на 
		// основную страницу.
		// 
		// Возможен небольшой хак чтоб получить `jQuery` объект для песочницы. Необходимо в качестве 
		// селектора передать объект `window` песочница, так же этот же `window` передать в качестве 
		// контекста.
		// 
		// __Пример:__  
		// 
		//         $sandbox = $(sandbox, sandbox);
		jQuery.fn.init = (function(Fn, proto) {
			var init = function(selector, context, rootjQuery) {
					if (typeof(selector) === 'string' && !context) {
						return new Fn(selector, window.document, rootjQuery);
					} else if (selector == sandbox && context != sandbox) {
						return new Fn(window, context, rootjQuery);
					} else if (selector == sandbox.document) {
						return new Fn(window.document, context, rootjQuery);
					} else if (selector == sandbox.document.head) {
						return new Fn(window.document.head, context, rootjQuery);
					} else if (selector == sandbox.document.body) {
						return new Fn(window.document.body, context, rootjQuery);
					} else {
						return new Fn(selector, context, rootjQuery);
					}
				};

			// Проставляем у нашей функции-оболочки в качестве прототипа прототип jQuery
			init.prototype = proto;
			return init;
		})(jQuery.fn.init, jQuery.fn);
	});
})(window.WebApp);
// version: 0.1.3
// -------------
// 
// __История версий:__  
// 
// * `0.1.3` - При включении транзита в песочнице отключается метод `pushState` благодаря чему все 
// приложения принуждаются к работе с `location.hash`.
// 
// * `0.1.2` - Исправлена ошибка в работе транзита, когда урл в песочнице проставлялся только после 
// второй смены урла основной страницы.
// 
// * `0.1.1` - Добавлена проверка существование `jQuery`, как зависимость для работы + рефакторинг 
// кода.
// 
// * `0.1.0` - Транзит для хеша в урле вынесен в отдельный файл.
// 
// После запуска данного транзита все изменения хеша в урле песочницы будут автоматически 
// транслироваться на основной урл главной страницы, как и наоборот.
(function(webapp) {
	// Объявляем локальные переменные
	var originalPushState,
		checkUrlTimer,
		$sandbox,
		$window,
		eventId;

	// Регистрируем транзит
	webapp.Core.registerTransit('location', function(window, sandbox, options) {
		// Добавлена возможность отключать использование транзита через опции приложения.
		try {
			if (options.loadOptions.disableTransits.location) {
				return;
			}
		} catch(e) {
			console.error(e);
		}

		if (typeof(jQuery) !== 'function') {
			console.error('This transit require jQuery to be defined!');
			return;
		}

		// Получаем ссылку на `jQuery` объект `window` из песочницы необходимый для навешивания 
		// событий и указания в качестве контекста поиска.
		$sandbox = $(sandbox, sandbox);
		$window = $(window);

		var sandboxRoute = this.getLocationHash(),
			windowRoute = this.getLocationHash(window),
			checkUrl = this.bind(function() {
				var newSandboxRoute = this.getLocationHash(),
					newWindowRoute = this.getLocationHash(window);

				if (sandboxRoute != newSandboxRoute) {
					windowRoute = sandboxRoute = newSandboxRoute;
					window.location.hash = windowRoute;
				} else if (windowRoute != newWindowRoute) {
					sandboxRoute = windowRoute = newWindowRoute;
					sandbox.location.hash = sandboxRoute;
				}
			}, this);

		eventId = this.generateId();

		// Хак отключающий `pushState` в песочнице принуждающий приложения запущенные в ней использовать 
		// `location.hash` вместо `html5.history` для работы с урлами.
		// 
		// [TODO] Реализовать правильную работу с `pushState`: https://trello.com/c/ZAGJ5aOK
		if (window.history && window.history.pushState) {
			originalPushState = sandbox.history.pushState;
			sandbox.history.pushState = null;
		}

		if (('onhashchange' in window)) {
			$window.on('hashchange.marrow' + eventId, checkUrl);
			$sandbox.on('hashchange.marrow' + eventId, checkUrl);
		} else {
			checkUrlTimer = setInterval(checkUrl, 50);
		}

		// При инициализации убеждаемся что в песочнице проставлен урл как у основного документа
		windowRoute = sandboxRoute;

		// Синхронизируем роуты до начала инициализации приложения
		checkUrl();
	}, function(window, sandbox, options) {
		try {
			if (options.loadOptions.disableTransits.location) {
				return;
			}
		} catch(e) {
			console.error(e);
		}

		if (typeof(jQuery) !== 'function') {
			console.error('This transit require jQuery to be defined!');
			return;
		}
		checkUrlTimer && clearInterval(checkUrlTimer);
		$sandbox.off('.marrow' + eventId);
		$window.off('.marrow' + eventId);

		// Востанавливаем отключенный функционал `pushState` в песочнице.
		sandbox.history.pushState = originalPushState;
	});
})(window.WebApp);
// Проверяем есть ли объект `console` в хостовом объекте `window` если нет, то создаем его во 
// избежание ошибок выполнения при наличии дебагеров в кода.
if (window.console == null) {
	window.console = {};
	console.log = console.info = console.warn = console.debug = console.group = console.groupEnd = console.error = console.time = console.timeEnd = function() {};
}
// version: 1.1.4
// -------------
// 
// Объект реализующий паттерн _pub/sub_ с полной поддержкой событий _jQuery_ но работающий на много 
// быстрее (http://jsperf.com/custom-pub-sub-test/3)
// 
// __Пример:__  
// 
// 1. Выстреливает глобальное событие `event_name` и передает в обработчик два аргумента;
// 
//         core.observatory.trigger('event_name', [argument1, argument2]);
// 
// 1. Создание обработчика на глобальное событие `event_name`, который принимает в качестве 
// аргументов объект _jQuery_ события и два аргумента переданные при выстреливании события
// 
//         core.observatory.on('event_name', function(event, argument1, argument2) {
//             code here
//         });
// 1. Создание одного обработчика на несколько глобальных событий `event_name1` и `event_name2`.
// 
//         core.observatory.on('event_name1 event_name2', function(event) {
//             code here
//         });
// 
// 1. Создание обработчика на глобальное событие `event_name`, который принимает в качестве 
// аргументов объект _jQuery_ события и два аргумента переданные при выстреливании события, 
// а так же обработчик вызывается с указаным контекстом (передается третьим аргументом)
// 
//         core.observatory.on('event_name', function(event, argument1, argument2) {
//             code here
//         }, this);
// 
// 1. Отписываемся от события
// 
//         core.observatory.off('event_name');
// 
// __Набор тестов на производительность:__
// 
// 1. http://jsperf.com/marrow-observatory/4 - Самый суровый кейс.  
// Каждый цикл навешивание событий -> Выстреливание -> Удаление события -> Выстреливание.
// 
// 1. http://jsperf.com/marrow-observatory-vs-jquery-trigger-events/4 - Самый простой кейс.  
// Навешивание событий и в каждом цыкле только выстреливание.
// 
// 1. http://jsperf.com/marrow-observatory-vs-jquery-bind-events-create-test - Тест на скорость 
// создания обсерватории и работы с событиями.
// 
// __История версий:__  
// 
// * `1.1.4` - Оптимизация методов для более быстрой работы.
// 
// * `1.1.3` - Исправлена ошибка с подменной контекста у одинаковых обработчиков разных инстансов 
// одного и того же класса.
// 
// * `1.1.2` - Вызов обработчика событий обернут в `try..catch` на случай если внутри обработчика 
// произойдет ошибка. В противном случае ошибка внутри обработчика может привести к обрыву цепочки 
// вызова обработчиков.
// 
// * `1.1.1` - Исправлена ошибка когда метод `off` не учитывал переданный обработчик и контекст.
// 
// * `1.1.0` - Полностью переписаны все методы для ускорения производительности и исправления 
// ошибок.
window.WebApp || (window.WebApp = {});
window.WebApp.Observatory = function() {
	var regex = /\s+/,
		contexts = [],
		handlers = [],
		eventMap = {},
		mutedNamesMap = {},
		mutedHandlerMap = {};

	this.on = function(eventName, handler, context) {
		var handlerId = handlers.length,
			name,
			event,
			events,
			namespace,
			delimiterIndex;

		if (!eventName || !handler || typeof(handler) !== 'function') {
			console.error('No event name or handler! Skipping...');
			return this;
		}

		if (eventName.indexOf(' ') >= 0) {
			events = eventName.split(regex);
		} else {
			events = [eventName];
		}

		// Добавляем обработчик в коллекцию обработчиков
		handlers.push(handler);

		// Добавляем контекст в коллекцию контекстов
		contexts.push(context);

		for (;events.length;) {
			name = null;
			namespace = null;
			event = events.shift();
			delimiterIndex = event.lastIndexOf('.');

			if (delimiterIndex >= 0) {
				name = event.substring(0, delimiterIndex);
				namespace = event.substring(delimiterIndex);
			} else {
				name = event;
			}

			if (name && namespace) {
				if (!eventMap[event]) {
					eventMap[event] = [];
				}
				eventMap[event].push(handlerId);
			}

			if (namespace) {
				if (!eventMap[namespace]) {
					eventMap[namespace] = [];
				}
				eventMap[namespace].push(handlerId);
			}

			if (name) {
				if (!eventMap[name]) {
					eventMap[name] = [];
				}
				eventMap[name].push(handlerId);
			}

			// Проверяем небыло ли "заглушено" событие.  
			// Если да, то делаем заглушение текущего обработчика.
			if (mutedNamesMap[event] || mutedNamesMap[name] || mutedNamesMap[namespace]) {
				mutedHandlerMap[handlerId] = handlers[handlerId];
				handlers[handlerId] = null;
			}
		}
		return this;
	};

	this.off = function(eventName, handler, context) {
		var name,
			event,
			events,
			handlerId;

		if (eventName.indexOf(' ') >= 0) {
			events = eventName.split(regex);
		} else {
			events = [eventName];
		}

		for (;events.length;) {
			name = events.shift();
			event = eventMap[name];

			if (event) {
				for (var i = 0, length = event.length; i < length; i++) {
					handlerId = event[i];

					if (handlers[handlerId]) {
						if (!handler || handler == handlers[handlerId]) {
							if (!context || contexts[handlerId] == context) {
								// Удаляем обработчик и контекст
								handlers[handlerId] = contexts[handlerId] = null;
							}
						}
					}
				}
			}
		}
		return this;
	};

	this.trigger = function(eventName, params) {
		var events,
			handler,
			handlerId;

		if (!eventName) {
			console.error('No event name! Skipping...');
			return this;
		}

		if (eventName.indexOf(' ') >= 0) {
			eventName = eventName.replace(' ', '');
		}
		events = eventMap[eventName];

		if (events) {
			for (var i = 0, length = events.length; i < length; i++) {
				handlerId = events[i];
				handler = handlers[handlerId];

				if (handler) {
					// Пытаемся вызвать обработчик событий с подготовленными аргументами
					try {
						// Проверяем если аргумент `params` это массив, то выполняем более сложную и медленную 
						// операцию вызова обработчика события.  
						// Если же `params` не определен или не является массивом, то выполняем быстрый вызов 
						// обработчика.
						if (typeof(params) === 'object' && typeof(params.concat) === 'function' && typeof(params.length) === 'number' && params.length) {
							handler.apply(contexts[handlerId], [eventName].concat(params));
						} else {
							handler.call(contexts[handlerId], eventName, params);
						}
					} catch(e) {
						// Если вызов прошел не успешно выдаем в консоль ошибку и продолжаем дальше
						console.error(e);
					}
				}
			}
		}
		return this;
	};

	this.mute = function(eventName) {
		var name,
			event,
			events,
			handlerId;

		if (!eventName) {
			console.error('No event name! Skipping...');
			return this;
		}

		if (eventName.indexOf(' ') >= 0) {
			events = eventName.split(regex);
		} else {
			events = [eventName];
		}

		for (;events.length;) {
			name = events.shift();

			if (!mutedNamesMap[name]) {
				mutedNamesMap[name] = 1;
				event = eventMap[name];

				if (event) {
					for (var i = 0, length = event.length; i < length; i++) {
						handlerId = event[i];

						if (!mutedHandlerMap[handlerId]) {
							mutedHandlerMap[handlerId] = handlers[handlerId];
							handlers[handlerId] = null;
						}
					}
				}
			}
		}
		return this;
	};

	this.unmute = function(eventName) {
		var name,
			event,
			events,
			handlerId;

		if (!eventName) {
			console.error('No event name! Skipping...');
			return this;
		}

		if (eventName.indexOf(' ') >= 0) {
			events = eventName.split(regex);
		} else {
			events = [eventName];
		}

		for (;events.length;) {
			name = events.shift();
			event = eventMap[name];

			if (event) {
				for (var i = 0, length = event.length; i < length; i++) {
					handlerId = event[i];

					if (mutedHandlerMap[handlerId]) {
						handlers[handlerId] = mutedHandlerMap[handlerId];
						delete mutedHandlerMap[handlerId];
					}
				}
			}
		}
		return this;
	};
};
