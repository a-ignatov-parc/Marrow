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
	this.version = '0.0.0';

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