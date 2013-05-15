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