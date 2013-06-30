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