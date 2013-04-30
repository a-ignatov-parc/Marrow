App.Models.User = App.Backbone.Model.extend({
	idAttribute: 'Id',

	url: function(method) {
		var url = this.core.hosts.services.auth;

		if (this.get('_page') == 'password_recovery') {
			if (method == 'create') {
				url += 'ResetPassword';
			}
		} else {
			switch(method) {
				case 'create':
					url += 'LogOn';
					break;
				case 'delete':
					url += 'LogOff';
					break;
			}
		}
		return url;
	},

	defaults: function() {
		return {
			Id: null,
			Email: null,
			Password: null,
			LastName: null,
			FirstName: null,
			MiddleName: null,

			// Служебные параметры
			_sync: YES,
			_page: null,
			_isLoged: NO
		};
	},

	roleToSectionMap: {
		1000: {
			title: 'Товары',
			link: 'products',
			route: 'products'
		},
		2000: {
			title: 'Шаблоны',
			link: 'templates',
			route: 'templates'
		},
		3000: {
			title: 'Работы',
			link: 'works',
			route: 'works'
		},
		5000: {
			title: 'Настройки',
			link: 'settings_blocks',

			// Алиасы можно записывать в качестве коллекции
			route: {
				'settings_types': YES,
				'settings_users': YES,
				'settings_blocks': YES,
				'settings_default_types': YES
			}
		},

		// Служебные секции (логин, востановление пароля)
		10000: {
			route: {
				'login': YES,
				'password_recovery': YES
			}
		}
	},

	initialize: function() {
		// Коллекция ролей у пользователя
		// 1001 Взять в работу 1000 Товары
		// 1002 Сдать работу   1000 Товары
		// 1003 Проверено      1000 Товары
		// 1004 Опубликовать   1000 Товары
		// 1005 Отклонить      1000 Товары
		// 
		// 2001 Взять в работу 2000 Шаблоны
		// 2002 Сдать работу   2000 Шаблоны
		// 2003 Проверено      2000 Шаблоны
		// 2004 Опубликовать   2000 Шаблоны
		// 2005 Отклонить      2000 Шаблоны
		// 
		// 3001 Взять в работу 3000 Работы
		// 3002 Сдать работу   3000 Работы
		// 3003 Проверено      3000 Работы
		// 3004 Опубликовать   3000 Работы
		// 3005 Отклонить      3000 Работы
		this.roles || this.resetRoles();

		// Регистрируем алиас для коллекции ролей
		this.__links('user_roles', this.roles);
		this.__links('user_sections', this.roleToSectionMap);
		this.__links('check_user_action', this.__bind(this.checkAction, this));

		this
			.on('sync', function(model) {
				model.set('_sync', YES);
			})
			.on('destroy', function(model) {
				var defaults = this.defaults();

				this.resetRoles();
				delete defaults.Email;
				delete defaults.Password;
				this.set(defaults, {
					silent: YES
				});
				this.core.navigate('login');
			}, this)
			.on('error', function(model, error, options) {
				for (var i = 0, length = error.length; i < length; i++) {
					this.core.observatory.trigger('controls:error', error[i]);
				}
			}, this);
	},

	setPage: function(name) {
		this.set('_page', name);
	},

	resetPage: function() {
		this.setPage(null);
	},

	resetRoles: function() {
		this.roles = {
			10000: YES
		};
	},

	checkAction: function(id) {
		var section = this.core.getHashUrl().section,
			roleIndex = 0,
			acceptedRoutes;

		for (var index in this.roleToSectionMap) {
			if (this.roleToSectionMap.hasOwnProperty(index)) {
				acceptedRoutes = this.roleToSectionMap[index].route || {};

				if (typeof(acceptedRoutes) === 'string') {
					if (acceptedRoutes == section) {
						roleIndex = +index;
					}
				} else {
					for (var route in acceptedRoutes) {
						if (acceptedRoutes.hasOwnProperty(route) && route == section) {
							roleIndex = +index;
							break;
						}
					}
				}

				if (roleIndex) {
					break;
				}
			}
		}
		roleIndex += id;
		return this.roles[roleIndex];
	},

	validate: function(attrs, options) {
		var errors = [];

		if (!attrs.Email || !('' + attrs.Email).length) {
			errors.push({
				cid: 'cEmail',
				type: 'required',
				text: 'Заполните поле'
			});
		} else if (!this.validateEmail(attrs.Email)) {
			errors.push({
				cid: 'cEmail',
				type: 'invalid',
				text: 'Неверный формат электронной почты'
			});
		}

		// На странице востановления пароля нету поля с паролем и его валидировать соответсвенно не нужно
		if (this.get('_page') != 'password_recovery') {
			if (!attrs.Password || !('' + attrs.Password).length) {
				errors.push({
					cid: 'cPassword',
					type: 'required',
					text: 'Заполните поле'
				});
			}
		}

		if (errors.length) {
			return errors;
		}
	},

	getData: function() {
		var data = this.toJSON(),
			menuData,
			index;

		data.MainMenu = [];

		for (index in this.roles) {
			if (this.roles.hasOwnProperty(index) && (index % 10) === 0) {
				if (menuData = this.roleToSectionMap[index]) {
					// Добавляем индекс в тело объекта для его последующей сортировки
					menuData.index = +index;
					data.MainMenu.push(menuData);
				}
			}
		}

		// Сортируем список меню чтоб отображался в правильном порядке
		data.MainMenu.sort(function(a, b) {
			return a.index - b.index;
		});
		return data;
	},

	validateEmail: function(email) {
		var reg = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return reg.test(email);
	},

	processRequestData: function(data, method) {
		switch(method) {
			case 'create':
				if (this.get('_page') == 'password_recovery') {
					data = {
						Email: data.Email
					};
				} else {
					data = {
						RememberMe: YES,
						Email: data.Email,
						Password: data.Password
					};
				}
				break;
			case 'delete':
				data = {};
				break;
		}
		this.set('_sync', NO);
		return data;
	},

	parse: function(response, xhr) {
		var returnObj = response.Result;

		// Проверяем объект ролей, если он небыл еще создан (в случае бутстрапа данных), то создаем
		this.roles || this.resetRoles();

		if (response.Success) {
			if (returnObj) {
				var list = returnObj.ActionNumbers.concat(returnObj.PageNumbers),
					nextRoute,
					route;

				for (var i = 0, length = list.length; i < length; i++) {
					if (list[i] != null) {
						this.roles[list[i]] = YES;
					}
				}
				delete returnObj.ActionNumbers;
				delete returnObj.PageNumbers;
				returnObj._isLoged = YES;

				// Если у нас модель уже инициализирована то сохраняем поля с параметром silent чтоб не 
				// стригерить проверку валидации. Если нет то просто возвращаем обработанные данные
				if (this.attributes) {
					route = this.core.getHashUrl();

					switch(route.section) {
						case 'login':
							nextRoute = 'templates';
							break;
						case 'password_recovery':
							nextRoute = 'login';
							break;
					}
					this.set(returnObj, {
						silent: YES
					});
				} else {
					return returnObj;
				}

				if (nextRoute) {
					// Обнуляем поле с паролем чтоб оно не хранилось в моделе
					this.set('Password', null, {
						silent: YES
					});
					this.core.navigate(nextRoute);
				}
			} else {
				this.core.navigate('login');
			}
		} else if (this.attributes) {
			noty({
				type: 'error',
				text: response.Message
			});
		}
	}
});