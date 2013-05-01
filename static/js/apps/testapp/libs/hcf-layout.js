/**
 * @version 1.0.120606
 * @description Header-Content-Footer Layout library for mediaquery resize processing.
 */

var HCF = function(options) {
	// Задаем значения по умолчанию
	this.styles = null;
	this.header = null;
	this.footer = null;
	this.active = false;
	this.contents = null;
	this.isSupportMQ = false;
	this.hasHeightTable = false;
	this.options = options || {};
	this.maxHeight = screen.height;
	this.headerHeight = this.footerHeight = 0;

	// Инициализируем библиотеку
	this.init();

	// Возвращаем объект с набором доступных для пользователя методов
	return {
		stop: this.getFn('stop'),
		start: this.getFn('start'),
		recheck: this.getFn('recheck'),
		elements: {
			header: this.header,
			contents: this.contents,
			footer: this.footer
		}
	}
};

HCF.prototype = {
	/**
	 * @description Метод инициализации работы библиотеки.
	 */
	init: function() {
		var processBlock = function(block) {
				if (block) {
					if (typeof(block) === 'string') {
						return $(block);
					} else if (block instanceof $) {
						var list = null;

						if (block.length > 1) {
							for (var i = 0, length = block.length, item; i < length; i++) {
								item = block.eq(i);

								if (!list) {
									list = processBlock(item)
								} else {
									list = list.add(processBlock(item));
								}
							}
						} else {
							list = block;
						}
						return list;
					}
				}
				return block;
			};

		this.id = +new Date();

		// Из переданных селекторов получаем jq объекты для дальнейшей работы с ними
		this.header = processBlock(this.options.header).first();
		this.contents = processBlock(this.options.contents);
		this.footer = processBlock(this.options.footer).first();

		// Проверяем поддерживает ли тикущий браузер media queries
		this.isSupportMQ = this.checkMQ();

		// Если в опциях не передали отложенный запуск, то запускаем обработчики событий
		if (!this.options.deferred) {
			// Навешиваем событие на изменение размера окна браузера и запускаем механизм расчета высоты блоков
			this.start();
		}
	},

	start: function() {
		if (!this.active) {
			this.active = true;
			$(window).on('resize.hcf-' + this.id, this.getFn('recheck'));
			this.recheck();
		}
	},

	stop: function() {
		this.active = false;
		$(window).off('.hcf-' + this.id);
		this.removeHeightTable();
	},

	/**
	 * @description Проверяет поддержку media queries браузером.
	 * @returns {Bool} Флаг говорящий о поддержки браузером media queries.
	 */
	checkMQ: function() {
		var dummy = $('<div id="mq-test-dummy">'),
			style = $('<style type="text/css">@media only all{#mq-test-dummy{width:10px}}</style>'),
			support = false;

		dummy
			.css({
				'top': -1000,
				'position': 'absolute'
			})
			.appendTo('body');
		style.appendTo('head');

		if (dummy.width() == 10) {
			support = true;
		}
		dummy.remove();
		style.remove();
		return support;
	},

	/**
	 * @description Метод возвращающий ссылку на вызов переданного метода в текущем контексте.
	 * @param {String} name Имя метода на которой нужно сделать ссылку с локальным контекстом.
	 * @returns {Function} Функция ссылающаяся на указанную функция в текущем контексте.
	 */
	getFn: function(name) {
		var fn = this[name],
			context = this;

		return function() {
			if (typeof(fn) === 'function') {
				return fn.apply(context, arguments);
			}
		}
	},

	/**
	 * @description Метод делающий нужные проверки во избежания лишних перерасчетов, если это возможно.
	 */
	recheck: function(forceRecheck) {
		if (this.active || forceRecheck) {
			var header = this.header,
				footer = this.footer,
				headerHeight = header.outerHeight(),
				footerHeight = footer.outerHeight();

			// Проверяем поддержку mq браузером
			if (this.isSupportMQ) {
				// Если браузер поддерживает mq, то проверяем не изменились ли высоты шапки и футера.
				// Если изменились, то удаляем старые стили и выставляем флаг на перерасчет новых стилей.
				if (!this.headerHeight || this.headerHeight != headerHeight) {
					this.headerHeight = headerHeight;
					this.removeHeightTable();
				}

				if (!this.footerHeight || this.footerHeight != footerHeight) {
					this.footerHeight = footerHeight;
					this.removeHeightTable();
				}
			} else {
				this.headerHeight = headerHeight;
				this.footerHeight = footerHeight;
				this.removeHeightTable();
			}

			// Если старые стили были удалены то собираем новые
			if (!this.hasHeightTable) {
				this.createHeightTable();
			}
			return true;
		}
		return false;
	},

	/**
	 * @description Метод в зависимости от поддержки mq либо генерирует таблицу стилей либо через js выставляет
	 *              высоту блоку.
	 * @param {Object} target Элемент в который нужно вставить сгенерированные стили.
	 */
	generateHeightTable: function(target) {
		var diffHeight = this.headerHeight + this.footerHeight;

		if (this.isSupportMQ) {
			// Получаем селекторы для блоков контентной части
			var selectors = typeof(this.options.contents) === 'string' ? this.options.contents : (!!this.options.contents.join && this.options.contents.join(', ')),
				styles = '';

			if (!selectors) {
				selectors = '.hcf-' + this.id;
				this.contents.addClass(selectors.slice(1));
			}
			styles += selectors + '{height:0px} ';

			// Если селекторы были получены, то генерируем таблицу стилей
			for (var i = diffHeight ; i < this.maxHeight; i++) {
				styles += '@media screen and (height:' + i + 'px){' + selectors + '{height:' + (i - diffHeight) + 'px}} ';
			}
			// После генерации вставляем стили в переданный DOM элемент
			target.html(styles);
		} else {
			var sizes = this.getBrowserSizes();

			// Высчитываем и выставляем высоту блока контентной части
			this.contents.height(sizes.y - diffHeight);
		}
	},

	/**
	 * @description Метод возвращающий размеры окна браузера.
	 * @returns {Object} Объект с ключами x и y содержащие значения ширины и высоты окна браузера соответственно.
	 */
	getBrowserSizes: function() {
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0];

		return {
			x: w.innerWidth || e.clientWidth || g.clientWidth,
			y: w.innerHeight || e.clientHeight || g.clientHeight
		}
	},

	createHeightTable: function() {
		if (this.isSupportMQ) {
			this.styles = $('<style type="text/css">');
			this.generateHeightTable(this.styles);
			this.styles.appendTo('head');
		} else {
			this.generateHeightTable();
		}
		this.hasHeightTable = true;
	},

	removeHeightTable: function() {
		this.styles && this.styles.remove();
		this.hasHeightTable = false;
	}
}