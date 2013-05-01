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
