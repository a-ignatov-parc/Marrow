// Генератор условий для тестирования задания от Яндекс: http://company.yandex.ru/job/vacancies/dev_geo_interface.xml
// Список тестов:
// 1. http://jsperf.com/yandex-observatory-speed-test-10-10-10
// 2. http://jsperf.com/yandex-observatory-speed-test-100-10-10
// 3. http://jsperf.com/yandex-observatory-speed-test-10-100-10
// 4. http://jsperf.com/yandex-observatory-speed-test-10-10-100
function Test(adapter, handlersCount, contextCount, eventNamesCount) {
	var handlers = [],
		contexts = [],
		events = [],
		i;

	function generateNum(range) {
		return Math.floor(Math.random() * (range || 1000));
	}

	// Генерируем заданное кол-во функций
	for (i = 0; i < handlersCount; i++) {
		handlers.push(function() {
			this.a + this.b;
		});
	}

	// Генерируем заданное кол-во контекстов с разными значениями
	for (i = 0; i < contextCount; i++) {
		contexts.push({
			a: generateNum(),
			b: generateNum()
		});
	}

	// Генерируем заданное кол-во имен событий
	for (i = 0; i < eventNamesCount; i++) {
		events.push('event' + i);
	}

	// Возвращаем объект для дальнейшей работы
	return {
		// Добавить все обработчики
		bind: function() {
			for (var i = 0, lenI = events.length; i < lenI; i++) {
				for (var j = 0, lenJ = handlers.length; j < lenJ; j++) {
					for (var k = 0, lenK = contexts.length; k < lenK; k++) {
						adapter.on(events[i], handlers[j], contexts[k]);
					}
				}
			}
		},

		// Отписаться от всех событий в случайном порядке
		remove: function() {
			for (;events.length;) {
				adapter.off(events.splice(generateNum(events.length), 1)[0]);
			}
		},

		// Бросить каждое событие 100 раз
		trigger: function() {
			for (var i = 0, length = events.length; i < length; i++) {
				for (var j = 0; j < 100; j++) {
					adapter.trigger(events[i]);
				}
			}
		}
	};
}