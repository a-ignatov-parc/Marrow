// Создаем отложенный набор тестов для приложения
window.runTests = function(App) {
	var jq = App.sandbox.$;

	test('Проверка среды для запуска тестов', function() {
		equal(typeof($), 'function', 'Объект jQuery найден в основной странице');
		equal(typeof(jq), 'function', 'Объект jQuery найден в песочнице');
		equal($.prototype.jquery, jq.prototype.jquery, 'Версии jQuery в основной странице и в песочнице совпадают');
	});

	test('Проверка создания и удаления DOM элемента', function() {
		jq('<div>')
			.attr('id', 'test_div')
			.appendTo('body');

		strictEqual($('#test_div').length, 1, 'Созданный элемент найден в основной странице');
		strictEqual(jq('#test_div').length, 1, 'Созданный элемент найден в основной странице при поиске с помощью jQuery песочницы');

		jq('#test_div').remove();

		strictEqual($('#test_div').length, 0, 'Удаленный элемент не найден в основной странице');
		strictEqual(jq('#test_div').length, 0, 'Удаленный элемент не найден в основной странице при поиске с помощью jQuery песочницы');
	});

	test('Проверка работы с DOM элементами', function() {
		var element = jq('<div>')
			.attr('id', 'test_div')
			.appendTo('body');

		strictEqual($('#test_div').is(':visible'), true, 'Созданный элемент видим');

		element.hide();

		strictEqual($('#test_div').is(':visible'), false, 'Созданный элемент невидим');

		element.show();

		strictEqual($('#test_div').is(':visible'), true, 'Созданный элемент cново видим');
		strictEqual($('#test_div').hasClass('test'), false, 'Созданный элемент не имеет класс test');
		strictEqual(element.hasClass('test'), false, 'Созданный элемент не имеет класс test');

		element.addClass('test');

		strictEqual($('#test_div').hasClass('test'), true, 'Созданный элемент не имеет класс test');
		strictEqual(element.hasClass('test'), true, 'Созданный элемент не имеет класс test');
	});
};

// Создаем и запускаем анонимное приложение для проведения тестирования.
(function() {
	var path = window.location.href,
		delimeterPos = path.indexOf('marrow'),
		rootPath = path.substr(0, delimeterPos);

	new WebApp.Loader(null, {
		loadOptions: {
			locations: {
				'static': rootPath + 'marrow/'
			},
			AppConstructor: function() {
				this.afterInit = function() {
					this.global.runTests(this);
				}
			}
		}
	});
})();