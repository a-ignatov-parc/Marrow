App.Views.Workspace = App.Backbone.View.extend({
	className: 'l-content-container l-content',
	template: 'workspace',

	initialize: function() {
		this.layouts = {};

		// Отрисовываем главную вью создавая каркас приложения
		this.render();

		// Навешиваем класс говорящий о том что приложение полностью инициализировалось
		this.core.container.addClass('l-app_is_ready');
	},

	setListeners: function() {
		this.core.router.on('route:after_change', this.onChangeRoute, this);
	},

	onMouseDown: function(event) {
		this.core.observatory.trigger('global.mousedown', event);
	},

	render: function() {
		this.$el
			.append(this.template())
			.appendTo(this.core.container);

		// Создаем объект лэйаута с сылками на ключевые элементы
		this.layouts = {
			header: this.$el.find('#l-header'),
			contents: this.$el.find('#l-body'),
			footer: this.$el.find('#l-footer'),
			start: this.__bind(function() {
				this.recalc();
			}, this),
			stop: this.__bind(function() {
				this.recalc(YES);
			}, this)
		};

		// Создаем ссылки в App.aliases на список лэйаутов и метод пересчета лэйаута
		this.__links('layouts', this.layouts);
		this.__links('recalc', this.__bind(this.recalc, this));
	},

	recalc: function(reset) {
		var footerHeight = reset ? 0 : this.layouts.footer.outerHeight();

		this.layouts.footer.css({
			height: footerHeight,
			marginTop: -footerHeight
		});
		this.layouts.contents.css('padding-bottom', footerHeight);
	},

	onChangeRoute: function(prevRoute, newRoute) {
		this.core.container
			.removeClass('l-' + prevRoute + '_route')
			.addClass('l-' + newRoute + '_route');
		this.recalc();
	}
});