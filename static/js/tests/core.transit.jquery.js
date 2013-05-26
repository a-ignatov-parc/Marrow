window.runTests = function(App) {
	test('Проверка существования класса ядра необходимого для инициализации', function() {
		equal(typeof($), 'function', 'Объект jQuery найден в основной странице');
		equal(typeof(App.sandbox.$), 'function', 'Объект jQuery найден в песочнице');
		equal($.prototype.jquery, App.sandbox.$.prototype.jquery, 'Версии jQuery в основной странице и в песочнице совпадают');
	});
}