/* jshint -W015 */
/* jshint -W014 */
/* jshint -W069 */
/* jshint -W098 */
/* jshint -W109 */
/* jshint -W117 */
App.Routers.Workspace = App.Backbone.Router.extend({
	defaultPage: 'gallery',
	namedParam: /:\w+/g,
	splatParam: /\*\w+/g,
	escapeRegExp: /[\-\[\]{}()+?.,\\\^$|#\s]/g,

	routes: {
		'': 'gallery',
		'index': 'index',
		'gallery': 'gallery',
		'gallery/:type': 'gallery',
		'gallery/:type/:id': 'gallery',
		'repair_map': 'repairMap',
		'apartment_plan': 'apartmentPlan',
		'apartment_plan/:id': 'apartmentPlan',
		':page': 'processWrongRoute'
	},

	initialize: function() {
		this.prevRoute = '';
		this.currentRoute = '';
	},

	// Метод для инициализации бандлов. Вызывается после инициализации роутера
	createBundles: function(initData) {
		this.core
			// Создаем источники данных
			.set('User', {
				view: NO,
				initData: initData.User
			})

			// Создаем вью
			.set('Gallery', {
				model: NO
			})
			.set('Popup', {
				model: NO,
				multiple: YES
			})
			.set('Hint', {
				model: NO,
				multiple: YES
			})
			.set('Pad', {
				model: NO,
				multiple: YES
			});
	},

	processWrongRoute: function() {
		this.navigate(this.defaultPage);
	},

	checkData: function() {
		return YES;
	},

	index: function() {
		var name = 'index',
			location = [name];

		if (this.checkData(name)) {
			this.navigate(location.join('/'));
			this.core
				.unload()
				.renderStream(['Header'/*, 'Map'*/]);
		}
	},

	repairMap: function() {
		var name = 'repair_map',
			location = [name];

		if (this.checkData(name)) {
			this.navigate(location.join('/'));
			this.core
				.unload()
				.renderStream(['Header', 'RepairInfo']);
		}
	},

	apartmentPlan: function(id) {
		var name = 'apartment_plan',
			location = [name];

		id != null && location.push(id);

		if (this.checkData(name)) {
			this.navigate(location.join('/'));
			this.core
				.unload()
				.renderStream(['Header']);

			if (id != null) {
				this.core.render('Plan', {
					planId: id
				});
			} else {
				this.core.render('ApartmentPlan');
			}
		}
	},

	gallery: function(type, id) {
		var name = 'gallery',
			location = [name];

		type != null && location.push(type);
		id != null && location.push(id);

		if (this.checkData(name)) {
			this.navigate(location.join('/'));
			this.core
				.unload()
				.render('Gallery');
		}
	}
});

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
var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["App"] = this["App"] || {};
this["App"]["Templates"] = this["App"]["Templates"] || {};

this["App"]["Templates"]["galleryList"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<ul>\n	<li>\n		<img src=\"http://farm4.static.flickr.com/3639/3319814586_dd9c1141dd.jpg?v=0\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a class=\"image_link\" href=\"/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/tanchristianr/\">Don Takz</a></cite>\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_notsogoodphotography.jpg\" alt=\"example pic flicker 1\" width=\"500\" height=\"335\" /> <cite><a href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> Par <a href=\"http://www.flickr.com/photos/notsogoodphotography/\">notsogoodphotography</a></cite>\n\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_junku.jpg\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/junku-newcleus/\">junku-newcleus</a></cite>\n	</li>\n	<li>\n		<img src=\"http://l.yimg.com/g/images/home_photo_pmorgan.jpg\" alt=\"example pic flicker 2\" width=\"500\" height=\"335\" /> <cite><a class=\"image_link\" href=\"http://www.flickr.com/creativecommons/\"><img width=\"16\" height=\"16\" class=\"trans_png\" alt=\"Licence Creative Commons\" src=\"http://l.yimg.com/g/images/home_cc.png\"/></a> By <a href=\"http://www.flickr.com/photos/pmorgan/\">pmorgan</a></cite>\n\n	</li>\n</ul>";
  });

this["App"]["Templates"]["workspace"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<div class=\"l-header\" id=\"l-header\"></div>\n<div class=\"l-content g-scrollable\" id=\"l-body\"></div>\n<div class=\"l-footer\" id=\"l-footer\"></div>";
  });

if (typeof exports === 'object' && exports) {module.exports = this["App"]["Templates"];}
App.Views.Gallery = App.Backbone.View.extend({
	className: 'carousel example-1',
	template: 'galleryList',

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el
			.html(this.template())
			.appendTo(this.__aliases.layouts.contents)
			.carousel();
	}
});