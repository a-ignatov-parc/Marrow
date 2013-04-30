// Проверяем есть ли объект `console` в хостовом объекте `window` если нет, то создаем его во 
// избежание ошибок выполнения при наличии дебагеров в кода.
if (window.console == null) {
	window.console = {};
	console.log = console.info = console.warn = console.debug = console.group = console.groupEnd = console.error = console.time = console.timeEnd = function() {};
}