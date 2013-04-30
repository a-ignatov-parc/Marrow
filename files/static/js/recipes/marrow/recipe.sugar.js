/*global
	_,
	Handlebars
*/
// version: 1.2.0
// -------------
// 
// __История версий:__  
// 
// * `1.2.0` - Из `core.js` вынесены все методы связанные с `backbone.js`.
// 
// Объявляем конструктор загрузчика приложений
window.WebApp || (window.WebApp = {});
window.WebApp.Marrow = function(Backbone) {
	if (Backbone.VERSION.indexOf('0.9') != -1) {
		var mutedTrigger = function() {
				return this;
			};

		// Расширяем прототип рецепта для добавления дополнительного функционала
		_.extend(this.Recipe.prototype, {
			// Метод который возвращает унифицированное значение DOM элемента.  
			// Метод вынесен сюда для того чтоб в любой момент времени им можно было воспользовать во вью и 
			// получить данные совместимые с правилами сохранения в модель контрола.
			getDomValue: function(domEl) {
				var target = $(domEl),
					value = target.val();

				if (target[0].type.toLowerCase() === 'checkbox') {
					value = target.prop('checked');
				}

				if (target[0].type.toLowerCase() === 'radio') {
					target = target
						.closest('.g-control_container')
						.find('input[id]');

					if (value == 'true' || value == 'false') {
						value = value == 'true';
					}
				}
				return value;
			},

			// Метод упрощающий работу с хелперами в _Handlebars_
			renderHelper: function(name, data) {
				var helper = Handlebars.helpers[name];

				if (helper) {
					return Handlebars.helpers[name](data).toString();
				}
			},

			// Метод объединяющий в хелпере данные из объекта с данными и данными переданные через кастомные 
			// атрибуты
			processHelperData: function(data, options) {
				// Создаем копию оригинального объекта чтоб изменения его не коснулись
				data = data ? _.clone(data) : {};
				options || (options = data.hash ? {
					hash: data.hash
				} : {});

				for (var key in options.hash) {
					if (options.hash.hasOwnProperty(key)) {
						data[key] = options.hash[key];
					}
				}
				return data;
			},

			// Упрощенный метод для перемещения по роутам
			// 
			// __Пример:__  
			// 
			// 1. Переход на роут `user` с запуском механизма роутинга
			// 
			//         core.navigate('user');
			// __Результат:__ `http://site.com/#!/user`
			// 
			// 1. Переход на роут `user` с запуском механизма роутинга и перезаписыванием последнего шага 
			// истории.
			// 
			//         core.navigate('user', YES);
			// __Результат:__ `http://site.com/#!/user`
			// 
			// 1. Переход на роут `user` с запуском механизма роутинга и последующим указанием дочернего урла
			// 
			//         core
			//             .navigate('user')
			//             .navigate('edit', NO, {
			//                 silent: YES,
			//                 isSubRoute: YES
			//             });
			// __Результат:__ `http://site.com/#!/user/edit`
			navigate: function(fragment, replace, params) {
				params || (params = {});
				this.router.navigate((params.isSubRoute ? this.getHashUrl().section + '/' : '') + fragment.replace(/^\/+/, ''), {
					trigger: !params.silent && YES,
					replace: !!replace
				});
				return this;
			},

			// Метод создающий бандл на основе вью и связанной с ней источником данных.  
			// Источником данных может быть как модель так и коллекция.  
			// На основе переданных параметров меняется поведение функционирования вью заключенной в бандле.  
			// При создании бандла источник данных инициализируется сразу и в бандл сохраняется ссылка на 
			// его инстанс. В случае передача ссылки на источник данных она просто присвается как собственная.
			// 
			// __Параметры:__
			// 
			// * `name` - (_string_) Имя создаваемого бандла. Обычно совпадает с именем вью и источника данных
			// 
			// * `params` - (_object_) Объект с доп.параметрами
			// 
			// __Возможные параметры объекта params:__
			// 
			// * `params.model` - (_object_) Ссылка на модели коллекции для ее создания и линкования в бандл 
			// в качестве источника данных.
			// 
			// * `params.isCollection` - (_bool_) Указывает на то является ли источником данных коллекция. Сокращает 
			// запись если вместо модели используется коллекция как источник данных.
			// 
			// * `params.multiple` - (_bool_) Указывает на то можем ли мы создать несколько инстансов вью 
			// завязанных на один и тот же источников данных.
			// 
			// * `params.initData` - (_object/array_) Данные с которыми будет инициализирован источник данных.
			// 
			// * `params.initOptions` - (_object_) Набор параметров, которые будут доступны в методе 
			// `initialize` вторым аргументом, как в моделе так и в коллекции.
			// 
			// * `params.standalone` - (_bool_) Указывает на то удалиться ли вью при вызове метода `Calc.unload()`.  
			// Вью в бандле с таким параметром можно будет удалить только вызвав `Calc.unload(<имя бандла>)`.
			// 
			// * `params.collection` - (_object_) Ссылка на конструктор коллекции для ее создания и линкования в 
			// бандл в качестве источника данных.
			// 
			// * `params.dataSource` - (_string_) Имя бандла чьей источник данных будет слинкован как источник 
			// данных создаваемого бандла
			// 
			// * `params.view` - (_string/object_) Ссылка на конструктор вьюкоторый будет использоваться для 
			// создания вью. Так же может передаваться строковое название вью, в таком случае конструктор 
			// будет искаться в глобальной коллекции вьюшек
			// 
			// * `params.dontAbortOnUload` - (_bool_) Указывает на то обрывать ли запросы модели при 
			// выгрузке связанных вью или нет.
			// 
			// * `params.unloadDataSource` - (_bool_) Указывает на то делать ли выгрузку источника данных в 
			// бандле при выгрузке вью. Выгрузка заключается в выстреле события и вызова метода `unload` 
			// у источника данных.
			// 
			// __Пример:__
			// 
			// 1. Регестрирование бандла включающего в себя вью с именем `User` и модель с таким же именем
			// 
			//         core.set('User');
			// 
			// 1. Регестрирование бандла включающего в себя вью с именем `User` и модель c именем `Bandit`
			// 
			//         core.set('User', {
			//             model: App.Models.Bandit
			//         });
			// 
			// 1. Регестрирование бандла у которого в качестве источника данных используется коллекция имя 
			// которой совпадает с именем вью.
			// 
			//         core.set('User', {
			//             isCollection: true
			//         });
			// 
			// 1. Регестрирование бандла включающего в себя только модель `User` + бандл `Header` который 
			// использует источник данных `User` для вывода информации о пользователе
			//
			//         core
			//             .set('User', {
			//                 view: false
			//             })
			//             .set('Header', {
			//                 dataSource: 'User'
			//             });
			set: function(name, params) {
				params = params || {};

				// Проверяем не был ли ранее создан бандл с таким же именем
				if (name != null && this['__' + name]) {
					throw 'Bundle with name "' + name + '" already exist!';
				}

				var view = params.view,
					Model = params.model,
					Collection = params.isCollection ? this.Collections[name] : params.collection,
					dataSource = params.dataSource,
					initData = params.initData,
					initOptions = params.initOptions,
					data = this.getBundleDefaultParams(params),
					exeptionList = {
						'view': YES,
						'_view': YES,
						'multiple': YES,
						'eventProxy': YES,
						'standalone': YES,
						'unloadDataSource': YES
					};

				if (dataSource) {
					var object = this.get(dataSource);

					for (var key in object) {
						if (object.hasOwnProperty(key) && !exeptionList[key]) {
							data[key] = object[key];

							if (name != null && key == 'model' || key == 'collection') {
								if (_.isArray(data[key].__bundlesList)) {
									data[key].__bundlesList.push(name);
								}
							}
						}
					}
				} else {
					if (Collection) {
						// Прописываем в коллекцию ссылку на объект веб-приложения
						Collection.prototype.core = this;
						Collection.prototype.__bind = this.bind;
						Collection.prototype.__links = this.bind(this.links, this);
						Collection.prototype.__aliases = this.aliases;
						Collection.prototype.__bundleName = name;

						// Если к коллекции слинкована модель то расширяем ее прототип аналогично коллекции
						if (Collection.prototype.model != null) {
							Collection.prototype.model.prototype.core = this;
							Collection.prototype.model.prototype.__bind = this.bind;
							Collection.prototype.model.prototype.__links = this.bind(this.links, this);
							Collection.prototype.model.prototype.__aliases = this.aliases;
							Collection.prototype.model.prototype.__bundleName = name;
						}

						// Создаем инстанс коллекции и записываем его в бандл
						data.collection = new Collection(initData, initOptions);

						// Присваиваем коллекции уникальный идентификатор `cid` так как на него может быть много 
						// завязано
						data.collection.cid = _.uniqueId('c');

						// Создаем список бандлов в работе которых используется данная коллекция
						data.collection.__bundlesList = [];
						name != null && data.collection.__bundlesList.push(name);
					} else {
						// Если модель не передана, то ищем ее по имени бандла
						if (Model == null && this.Models[name]) {
							Model = this.Models[name];
						}

						// Если модель передана как строка, то ищем ее по переданной строке
						if (typeof(Model) === 'string') {
							Model = this.Models[Model];
						}

						// Если модель существует, то создаем ее инстанс и записываем в бандл
						if (Model) {
							// Прописываем в модель ссылку на объект веб-приложения
							Model.prototype.core = this;
							Model.prototype.__bind = this.bind;
							Model.prototype.__links = this.bind(this.links, this);
							Model.prototype.__aliases = this.aliases;
							Model.prototype.__bundleName = name;

							// Создаем инстанс модели и записываем его в бандл
							data.model = new Model(initData, initOptions);

							// Создаем список бандлов в работе которых используется данная коллекция
							data.model.__bundlesList = [];
							name != null && data.model.__bundlesList.push(name);
						}
					}
				}

				if (data.model || data.collection) {
					data.eventProxy = this.createEventProxy(data.model || data.collection);
				}

				// Если вью не передана, то ищем ее по имени бандла
				if (view == null && this.Views[name]) {
					view = this.Views[name];
				}

				// Если вью передана как строка, то ищем ее по переданной строке
				if (typeof(view) === 'string' && this.Views[view]) {
					view = this.Views[view];
				}

				// Если вью существует, то записываем ссылку на конструктор в бандл
				if (view) {
					data._view = view;
				}

				// Проставляем во вью имя бандла к которому она относится.  
				// Необходимо для работы метода `.unload()` внутри вью.
				if (data._view != null) {
					data._view.prototype.core = this;
					data._view.prototype.__bind = this.bind;
					data._view.prototype.__links = this.bind(this.links, this);
					data._view.prototype.__aliases = this.aliases;
					data._view.prototype.__document = this.global.document;

					// Если у бандла есть вью, то глушим событийный механизм до момента отрисоки привязанной вью
					data.mute();
				} else if (dataSource != null) {
					data = null;
					throw 'You can\'t link bundle to data source!';
				}

				// Если имя бандла было передано и не равно `null`, `undefined` или `false`, то сохраняем его в 
				// коллекцию бандлов иначе просто возвращаем объект бандла
				if (name != null && name !== NO) {
					this['__' + name] = data;
					this.list.push(name);

					// Обязательно создаем ссылку в `App.aliases` на модель или коллекцию если они используются в
					// бандле
					if (data.model || data.collection) {
						this.links('_' + name, (data.model || data.collection));
					}
				} else {
					// Если бандл не записывается в глобальную коллекцию, то для упрощения работы с ним добавляем метод `render`
					data.render = function(params) {
						params || (params = {});

						if (this.view == null && typeof(this._view) === 'function') {
							this.unmute();
							this.view = new this._view(_.extend(params, this));
							return this.view;
						}
					};

					data.unload = function() {
						if (this.view != null) {
							this.view.core.unload(this);
						}

						// Если у бандла есть модель, то мы ее уничтожаем
						if (this.model != null) {
							// Если у модели есть активные запросы, то обрываем их
							if (!this.dontAbortOnUload) {
								this.model.abortAjax();
							}

							// Отписываем все глобальные обработчики, которые создала текущая модель
							this.model.core.observatory.off('.' + this.model.cid);

							// Производим более глубокую вычистку модели
							this.model.core.unloadDataSource(this.model);

							// Отписываем все события модели и удляем ссылку на нее.  
							// Позже она будет вычищена CG браузера
							this.model.off();
							this.model = null;
						}

						// Если у бандла есть коллекция, то мы ее уничтожаем
						if (this.collection != null) {
							// Если у коллекции есть активные запросы, то обрываем их
							if (!this.dontAbortOnUload) {
								this.collection.abortAjax();
							}

							// Отписываем все глобальные обработчики, которые создала текущая коллекция
							this.collection.core.observatory.off('.' + this.collection.cid);

							// Производим более глубокую вычистку коллекции
							this.collection.core.unloadDataSource(this.collection);

							// Отписываем все события коллекции и удляем ссылку на нее.  
							// Позже она будет вычищена CG браузера
							this.collection.off();
							this.collection = null;
						}

						// Если у бандла есть `eventProxy`, то мы отписываем все события и тоже удаляем
						if (this.eventProxy != null) {
							this.eventProxy = null;
						}
					};
					return data;
				}
				return this;
			},

			// Методе который выполняет алгоритм выгрузки модели или коллекции выстреливая служебное событие, 
			// которые позволит внутри модели/коллекции провести более сложную вычистку "мусора".
			unloadDataSource: (function() {
				var partialRemover = function(data) {
						if (typeof(data.unload) === 'function') {
							data.unload();
						}
					};

				return function(source) {
					source || (source = {});

					if (typeof(source.trigger) === 'function') {
						source.trigger('core:unload', partialRemover);
					}
				};
			})(),

			// Метод создает локальный бандл (он не появляется в списке бандлов так как не поднимается в 
			// глобальную область видимости) с моделью чье имя передается в аргументах после чего возвращает 
			// модель из бандла которая отличается от обычного инстанса _Backbone.Model_ расширеными свойствами.
			// 
			// __Пример:__
			// 
			// 1. Создание локальной версии модели `User`
			// 
			//         core.setModel('User');
			// 
			// 1. Создание локальной версии модели `User` c параметрами
			// 
			//         core.setModel('User', {
			//             initData: {
			//                 FirstName: 'Jon',
			//                 LastName: 'Doe'
			//             }
			//         });
			setModel: function(name, params) {
				params || (params = {});
				params.model = this.Models[name] || this.Backbone.Model;
				return this.set(null, params).model;
			},

			// Метод создает локальный бандл (он не появляется в списке бандлов так как не поднимается в 
			// глобальную область видимости) с моделью чье имя передается в аргументах после чего возвращает 
			// модель из бандла которая отличается от обычного инстанса _Backbone.Model_ расширеными свойствами.
			// 
			// __Пример:__
			// 
			// 1. Создание локальной версии коллекции для валидаторов
			// 
			//         core.setCollection('Validators');
			// 
			// 1. Создание локальной версии коллекции для валидаторов с бутстрапом изначального списка
			// 
			//         core.setCollection('Validators', {
			//             initData: model.get('Validators')
			//         });
			setCollection: function(name, params) {
				params || (params = {});
				params.collection = this.Collections[name] || this.Backbone.Collection;
				return this.set(null, params).collection;
			},

			// Метод который отрисовывает вью бандла по его имени передавая в созданный инстанс вью 
			// указанные параметры.  
			// Если указан параметр `multiple`, то каждый раз будет создаваться новый временный параметр 
			// который будет наследоваться от первоначального и иметь имя родителя + рендомное число
			// 
			// __Пример:__
			// 
			// 1. Отрисока бандла по его имени
			// 
			//         core.render('Menu');
			// 
			// 1. Отрисовка бандла по его имени с передачей дополнительно параметров
			// 
			//         core.render('Menu', {
			//             context: 'agent'
			//         });
			render: function(name, params) {
				params || (params = {});
				this._multiplyCollection || (this._multiplyCollection = {});

				var data = this.get(name),
					viewData = _.extend(params, data, {
						__afterInit: [],
						__bundleName: name
					});

				if (data && data._view && !data.view) {
					// Перед инициализацией вью включаем событийный механизм у источника данных бандла
					data.unmute();

					if (data.multiple) {
						var tmpName = name + this.generateId(),
							dummyBundle = _.extend({}, data);

						// Указываем потомку кто у него родитель
						this._multiplyCollection[name] || (this._multiplyCollection[name] = {});
						this._multiplyCollection[name][tmpName] = YES;
						dummyBundle.parentName = name;
						dummyBundle.parent = NO;
						viewData.__bundleName = tmpName;
						name = tmpName;
						dummyBundle.view = new dummyBundle._view(viewData);

						this['__' + name] = dummyBundle;
						this.list.push(name);

						// Перезаписываем оригинальный объект `data` на вновь созданный
						data = dummyBundle;
					} else {
						this['__' + name].view = new data._view(viewData);
					}

					if (data.view && data.view.__afterInit && data.view.__afterInit.length) {
						for (var i = 0, length = data.view.__afterInit.length, fn; i < length; i++) {
							fn = data.view.__afterInit[i];

							if (typeof(fn) === 'function') {
								fn.call(data.view);
							}
						}
					}
				}
				return data;
			},

			// Метод позволяющий передавать массив имен бандлов с параметрами или без к которым при 
			// отрисовке будут примен общий набор параметров
			// 
			// __Пример:__
			// 
			// 1. Отрисока нескольких бандлов с передачей в каждый из них одного и того же набора параметров
			// 
			//         core.renderStream(['Menu', 'Content', 'Footer'], {
			//             context: 'agent'
			//         });
			// 
			// 1. Отрисока нескольких бандлов с передачей в каждый из них одного и того же набора 
			// параметров + дополнительной передачей кастомного набора параметров в один из бандлов
			// 
			//         core.renderStream([{
			//             name: 'Menu',
			//             params: {
			//                 params: params,
			//                 value: value
			//             }
			//         }, 'Content', 'Footer'], {
			//             context: 'agent'
			//         });
			renderStream: function(bundlesList, params) {
				params || (params = {});

				for (var i = 0, length = bundlesList.length, bundle, name; i < length; i++) {
					bundle = bundlesList[i];
					name = '';

					if (typeof(bundle) === 'string') {
						name = bundle;
					} else if (bundle.name != null) {
						name = bundle.name;
					}
					this.render(name, _.extend({}, params, bundle.params));
				}
				return this;
			},

			// Метод получения бандла по его имени.  
			// Если бандла с таким именем не существует то вернется пустой бандл
			// 
			// __Пример:__
			// 
			// 1. Получение бандла по имени
			// 
			//         core.get('User');
			get: function(name) {
				var bundle = this['__' + name] || _.extend(this.getBundleDefaultParams(), {
						parent: NO,
						isDummy: YES,
						_view: this.Backbone.View
					});

				if (typeof(name) !== 'string') {
					delete bundle.isDummy;
					delete bundle.eventProxy;

					// Если переданное имя бандла на самом деле является моделью, то присваиваем ее в соответсвующее
					// поле `bundle.model`
					if (name instanceof this.Backbone.Model) {
						bundle.model = name;
					}

					// Если переданное имя бандла на самом деле является коллекцией, то присваиваем ее в 
					// соответсвующее поле `bundle.collection`
					if (name instanceof this.Backbone.Collection) {
						bundle.collection = name;
					}
				}
				return bundle;
			},

			// Метод возвращающий параметры бандла по умолчанию
			getBundleDefaultParams: function(params) {
				params || (params = {});
				return {
					parent: YES,
					isDummy: NO,
					multiple: !!params.multiple,
					standalone: !!params.standalone,
					dontAbortOnUload: !!params.dontAbortOnUload,
					unloadDataSource: !!params.unloadDataSource,
					mute: this.mute,
					unmute: this.unmute
				};
			},

			// Метод, который выключит событийный механизм источника данных у бандла
			mute: function() {
				var dataSource = this.model || this.collection;

				if (dataSource && typeof(dataSource.mute) === 'function') {
					dataSource.mute();
				}
			},

			// Метод, который включит событийный механизм источника данных у бандла
			unmute: function() {
				var dataSource = this.model || this.collection;

				if (dataSource && typeof(dataSource.unmute) === 'function') {
					dataSource.unmute();
				}
			},

			// Метод который делает выгрузку всех отрисованых бандлов у которых не указан параметр `standalone`.  
			// Для выгрузки самодостаточных бандлов необходимо в метод передать имя бандла в качестве 
			// аргумента.  
			// При выгрузке бандлов с параметром `multiple` все бандлы потомки будут выгруженны и удалены.
			// 
			// __Пример:__
			// 
			// 1. Выгрузка всех отрисованых бандлов
			// 
			//         core.unload();
			// 
			// 1. Выгрузка конкретного бандла по его имени
			// 
			//         core.unload('Header');
			// 
			// 1. Выгрузка нескольких бандлов по их имени
			// 
			//         core.unload('Header Footer User');
			unload: function(viewName) {
				// Если `viewName` передан, как строка, то разбиваем его на массив используя пробел в качестве 
				// разделителя.
				var list = viewName ? (typeof(viewName) === 'string' ? viewName.split(' ') : [viewName]) : this.list,
					currentHashUrl = window.location.hash.replace('/', '');

				for (var i = 0, length = list.length, name; i < length; i++) {
					name = list[i];

					if (name != null) {
						var object = typeof(name) === 'string' ? this.get(name) : name,
							isStandalone = !!object.standalone,
							multiplies = this._multiplyCollection || {},
							view = object.view;

						if (isStandalone && object.standalone.push) {
							for (var j = 0, jlength = object.standalone.length; j < jlength; j++) {
								if (currentHashUrl.indexOf(object.standalone[j].replace('/', '')) >= 0) {
									isStandalone = YES;
									break;
								}
							}
						}

						if (!isStandalone || !!viewName) {
							if (view) {
								// Если вью существует и мы ее выгружаем, то отпишем любые обработчики событий навешиваемые 
								// на `eventProxy`
								if (object.eventProxy) {
									object.eventProxy.off();
								}

								// Обрываем все активные запросы у бандла
								if (!object.dontAbortOnUload && (object.model || object.collection)) {
									// Если у модели или коллекции есть активные запросы, то обрываем их
									this.Backbone.sync('abort', object.model || object.collection);
								}

								// Если существует метод `beforeUnload` и он является функцией, то выполняем его
								if (typeof(view.beforeUnload) === 'function') {
									view.beforeUnload();
								}
								view.remove();
								delete object.view;

								// При выгрузке вью заглушаем все источники данных в бандле, чтоб они перестали отрабатывать 
								// свой функционал.  
								// Работает только для бандлов у которых есть вью.
								object.mute();

								if (object.unloadDataSource) {
									// Выстреливаем событие о выгрузке бандла.  
									// Если нужно это как-то обработать подписываемся на событие `core:unload`
									this.unloadDataSource(object.model || object.collection);
								}
							}

							if (!object.parent) {
								var parentList = multiplies[object.parentName];

								if (parentList) {
									parentList[name] = NO;
								}

								if (object.model || object.collection) {
									this.removeFromBundlesList(object.model || object.collection, name);
								}
								delete this['__' + name];
							} else {
								var children = multiplies[name];

								if (children) {
									for (var child in children) {
										if (children.hasOwnProperty(child) && children[child]) {
											this.unload(child);
										}
									}
								}
							}
						}
					}
				}
				return this;
			},

			removeFromBundlesList: function(target, name) {
				if (target && _.isArray(target.__bundlesList)) {
					var index = _.indexOf(target.__bundlesList, name);

					if (index >= 0) {
						target.__bundlesList.splice(index, 1);
					}
				}
			}
		});

		// Расширяем прототип вью в _Backbone.js_
		// -------------
		// 
		// Объект на который при использовании датабиндинга навешиваются обработчики событий связанной 
		// модели.
		Backbone.View.prototype._modelDataBindProxy = null;

		// Метод отвязывающий датабиндинг от модели
		Backbone.View.prototype._unbindDataBindProxy = function() {
			if (this._modelDataBindProxy) {
				this._modelDataBindProxy.off();
				this._modelDataBindProxy = null;
			}
		};

		// Метод в котором идет подготовка к уничтожению вью.  
		// Например снятие глобальных событий, добавление/удаление стилей на стороние элементы и т.д.
		Backbone.View.prototype.beforeUnload = function() {
			return this;
		};

		// Переопределяем метод `Backbone.View._configure` для того чтоб сделать инъекцию переменной с 
		// предкомпилированным шаблоном до инициализации вью
		Backbone.View.prototype._configure = (function(fn) {
			return function(options) {
				// Переносим значение параметра `__bundleName` в текущий инстанс вью
				if (options.__bundleName != null) {
					this.__bundleName = options.__bundleName;
					delete options.__bundleName;
				}

				// Переносим значение параметра `__afterInit` в текущий инстанс вью
				if (options.__afterInit != null) {
					this.__afterInit = options.__afterInit;
					delete options.__afterInit;
				}

				// Заменяем значение `this.template` с селектором на элемент содержащий шаблон, на 
				// предкомпилированный шаблон
				if (typeof(this.template) === 'string' && this.core.Templates[this.template]) {
					this.template = this.core.Templates[this.template];
				}
				return fn.apply(this, arguments);
			};
		})(Backbone.View.prototype._configure);

		// Удаляем вью из контекста бандла переводя его в состояние не отрисованного
		Backbone.View.prototype.unload = function() {
			// Убираем обработчики событий используемые в датабиндинге
			try {
				this.$el.off('.databinding');
				this._unbindDataBindProxy();
			} catch(e) {}

			// Проверяем есть ли у нас во вью значения `__bundleName` (имя бандла к которому относится вью) 
			// и `core` (ссылка на _scope_ приложения).
			if (this.__bundleName != null && this.core != null) {
				// Если бандл с переданым именем не найден значит вью еще не до конца инициализированна и 
				// обработку нужно отложить.  
				// Если бандл существует, то делаем его выгрузку
				if (this.core.get(this.__bundleName).isDummy) {
					this.__afterInit.push(this.unload);
				} else {
					this.core.unload(this.__bundleName);
				}
			}
			return this;
		};

		// Метод инициализирующий датабиндинг текущей вью с указанной моделью. Если модель не указана то 
		// будет использоваться текущая.  
		// Для правильной работы датабиндинга у связываемой модели обязательно должен быть метод 
		// `updateModel(key, attr, value, targetElement, options)` который является адаптером для работы с 
		// конкретной структурой каждой модели.
		// 
		// Принимает следующие параметры которые влияют на результат выполнения метода:
		// 
		// * `modelAttr` - (_string/object_) Если переданный параметр это строка, то он указывает к 
		// какому полю текущей модели привязывать измениня контрола.  
		// Если передан объект, то в нем указывается связь атрибутов контрола и полей модели.
		// 
		// * `model` - (_object_) Передается ссылка на модель или коллекцию которая должна обрабатывать 
		// изменение контрола.
		// 
		// * `params` - (_object_) Набор дополнительных параметров которые может обрабатывать функция.
		// 
		// В объект `params` могут быть переданны следующие параметры:
		// 
		// * `onkeyup` - (_bool/number_) Параметр указывающий что событие об изменении контрола должно 
		// срабатывать по событию `keyup`.  
		// Если передан `true`, то событие будет срабатывать при каждом нажатии, если передано число, то 
		// событие будет выстреливать через указанное количество милисекунд после последнего события.
		// 
		// * `allowKeyupHandler` - (_fn_) Метод который определяет можно ли обрабатывать изменения 
		// контрола по событию `keyup`.  
		// Если вернется "правдивое" значение то обработчик события `keyup` будет работать в штатном 
		// режиме. Если вернется ложное значение, то обработчик события `keyup` не будет срабатывать.
		// 
		// __Пример:__  
		// 
		// 1. Привязываем вью к своей модели по полю `Value`
		// 
		//         this.bindData('Value');
		// 
		// 1. Привязываем вью к своей модели по набору полей. Ключи объекта это атрибуты _DOM_ элемента и 
		// зарезервированные значения.
		// 
		//         this.bindData({
		//             value: 'Value',
		//             enabled: 'IsEdit',
		//             visible: 'IsVisible'
		//         });
		// 
		// 1. Привязываем вью к источнику данных с именем _User_ по полю `Value`
		// 
		//         this.bindData('Value', 'User');
		// 
		// 1. Привязываем вью к моделе _User_ по полю `Value`
		// 
		//         this.bindData('Value', this.__aliases._User);
		Backbone.View.prototype.bindData = function(modelAttr, model, params) {
			if (typeof(model) === 'string') {
				model = this.__aliases['_' + model];
			}
			model || (model = (this.model || this.collection));
			params || (params = {});

			// Если у бандла нету источников данных и он не передан в аргументах, то выходим из метода
			if (!model) {
				return;
			}

			var view = this,
				reverseAttr = {},
				modelAttrLength = 0,
				getValue = this.core.getDomValue,
				proxy = this.core.createEventProxy(model);

			if (typeof(modelAttr) === 'string') {
				modelAttr = {
					value: modelAttr
				};
			} else if (modelAttr == null) {
				modelAttr = {};
			}

			// Создаем обратную коллекцию связки для быстрой обработки во время изменения моделей
			for (var key in modelAttr) {
				if (modelAttr.hasOwnProperty(key)) {
					if (typeof(modelAttr[key]) === 'string') {
						reverseAttr[modelAttr[key]] = key;
						modelAttrLength++;
					} else if (modelAttr[key].push) {
						for (var i = 0, length = modelAttr[key].length; i < length; i++) {
							reverseAttr[modelAttr[key][i]] = key;
							modelAttrLength++;
						}
					}
				}
			}

			// Если передан параметр `blind`, то мы не навешиваем события на вью оставляя только события об 
			// изменении модели
			if (!params.blind) {
				// Навешиваем обработчик на изменения всех элементов у которых есть aтрибут name.
				this.$el.on('change.databinding', '[name]', function(event) {
					var target = $(event.currentTarget),
						value = getValue(target),
						attr = modelAttr.value,
						key = target[0].name;

					model.updateModel(key, attr, value, target, {
						// Для возможности предобработать данные во вью нужно добавить метод `processDataBind` в 
						// который передаются те же самые аргументы что и в метод `updateModel`
						viewData: typeof(view.processDataBind) === 'function' && view.processDataBind(key, attr, value, target)
					});
				});

				if (params.onkeyup != null) {
					var timeout = typeof(params.onkeyup) === 'number' ? params.onkeyup : 0,
						debounce = _.debounce(function(event) {
							var target = $(event.currentTarget);

							if (typeof(params.allowKeyupHandler) === 'function' && !params.allowKeyupHandler(event, target)) {
								return;
							}
							target.trigger('change');
						}, timeout);

					this.$el.on('keyup.databinding', '[name]', debounce);
				}
			}

			// Навешиваем обработчик на изменение модели.
			proxy.on('change', function(model, options) {
				options || (options = {});

				if (options.changes) {
					for (var key in options.changes) {
						if (!modelAttrLength || options.changes.hasOwnProperty(key) && reverseAttr[key]) {
							this.changeControl(model.cid, reverseAttr[key], model.get(key), model);
						}
					}
				}
			}, this);

			// Отписываем старую привязку если она была и создаем новую
			this._unbindDataBindProxy();
			this._modelDataBindProxy = proxy;
		};

		// Метод реализующий изменения _DOM_ состовляющей контрола.  
		// Для кастомной обработки может быть переопределен во вью.
		Backbone.View.prototype.changeControl = function(cid, attr, value) {
			var target = $('#control-' + cid);

			switch(attr) {
			case 'value':
				switch(target[0].type.toLowerCase()) {
				case 'checkbox': 
					target.prop('checked', value);
					break;
				case 'radio':
					target
						.closest('.g-control_container')
						.find('input')
						.val([value]);
					break;
				default: 
					target.val(value);
					break;
				}
				break;
			case 'datavalue':
				var names = [],
					values = [];

				for (var i = 0, length = value.length; i < length; i++) {
					if (value[i]) {
						values.push(value[i].Id);
						names.push(value[i].Name);
					}
				}
				target
					.val(values)
					.closest('.g-control_container')
					.find('input')
					.val(names.join(', '));
				break;
			case 'visible':
				// Класс `g-control_container` должен обязательно находится на контейнере контрола чтоб можно 
				// было сделать универсальный траверсинг
				target
					.closest('.g-control_container')
					.toggleClass('g-hidden', !value);
				break;
			case 'enabled':
				target
					.attr('disabled', !value)
					.closest('.g-control_container')
					.toggleClass('g-control--disabled', !value);
				break;
			}
		};

		// Расширяем прототип модели в _Backbone.js_
		// -------------
		// 
		// Метод который удалит из коллекцию модель состоящую в этой коллекции
		Backbone.Model.prototype.remove = function(options) {
			try {
				this.collection.remove(this.cid, options);
			} catch(e) {}
			return this;
		};

		// Метод который получает оригинальные данные модели вырезает из них служебные поля по префиксу 
		// `_` и запускает на кастомную обработку если это нужно
		Backbone.Model.prototype.toReqJSON = (function(fn) {
			return function(method, options) {
				var data = fn.apply(this, arguments);

				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						// Если у имени поля есть префикс с подчеркиванием то вырезаем его
						if (!key.indexOf('_')) {
							delete data[key];
						}
					}
				}

				if (typeof (this.processRequestData) === 'function') {
					return this.processRequestData(data, method, options);
				}
				return data;
			};
		})(Backbone.Model.prototype.toJSON);

		// Метод который можно переопределять в конкретной модели для дополнительной постобработки 
		// обработки данных для отправки на сервис в зависимости от метода запроса
		Backbone.Model.prototype.processRequestData = function(data) {
			return data;
		};

		// Добавляем в прототипы модели и коллекции метод `abortAjax` при вызове которого будут сброшены 
		// все активные запросы сделанные данной моделью/коллекцией.
		Backbone.Model.prototype.abortAjax = Backbone.Collection.prototype.abortAjax = function(ajax, params) {
			var ajaxIndex;

			if (this.__ajaxReq && this.__ajaxReq.length) {
				for (var i = 0, length = this.__ajaxReq.length; i < length; i++) {
					if (!ajax || ajax && ajax == this.__ajaxReq[i]) {
						try {
							// Перед обрывом запроса добавляем кастомное поле `abortStatus` по которому можно определить 
							// обрыв произошел по желанию пользователя или из-за проблем со связью.
							this.__ajaxReq[i].abortStatus = params && params.abortStatus || 'user';
							this.__ajaxReq[i].abort();
						} catch(e) {}

						if (ajax) {
							ajaxIndex = i;
							break;
						}
					}
				}

				// Если переменная `ajaxIndex` существует, то удаляем из коллекции ячейку с индексом, который 
				// указан в переменной, иначе полностью очищаем коллекцию.
				if (ajaxIndex != null) {
					this.__ajaxReq.splice(ajaxIndex, 1);
				} else if (!ajax) {
					this.__ajaxReq.length = 0;
				}
			}
		};

		// Метод после выполнения которого данная модель или коллекция перестанет выстреливать события 
		// даже если будет вызываться метод `trigger`.  
		// Так же будут "заглушены" все обработчики событий выстреливаемые на `core.observatory` у 
		// которых в качестве неймспейса событий указывался `cid` данной модели или коллекции.
		Backbone.Model.prototype.mute = Backbone.Collection.prototype.mute = function() {
			var hasActiveLinkedViews = NO;

			if (!this.__muted) {
				for (var i = 0, length = this.__bundlesList.length; i < length; i++) {
					var linkedBundle = this.core.get(this.__bundlesList[i]);

					// Проверяем если у связанного бандла есть отрисованная вью или он явзяется источником 
					// данных (нет `bundle._view`), то выставялем флаг чтоб модель или коллекцию нельзя было 
					// заглушить.
					if (!!linkedBundle.view || linkedBundle._view == null) {
						hasActiveLinkedViews = YES;
						break;
					}
				}

				if (!hasActiveLinkedViews) {
					// Проставляем флаг о том что модель или коллекция заглушена.
					this.__muted = YES;

					// Заменяем метод который выстреливает события на пустышку благодаря чему данная модель не 
					// сможет выстрелить ни одно событие.
					this.trigger = mutedTrigger;

					// Заглушаем обработчики в обсерватории которые были подписаны с неймспейсом равным `cid` данной 
					// модели или коллекции.
					this.core.observatory.mute('.' + this.cid);
				}
			}
		};

		// Метод который востановит нормальное функционирование событийного механизма данный модели 
		// или коллекции.
		Backbone.Model.prototype.unmute = Backbone.Collection.prototype.unmute = function() {
			// Проставляем флаг о том что модель больше не заглушена
			this.__muted = NO;

			// Востанавливаем правильный метод `trigger`
			this.trigger = Backbone.Events.trigger;

			// Отключаем глушение обработчиков событий повешенные на обсерваторию с неймспейсом равным `cid` 
			// данной модели или коллекции.
			this.core.observatory.unmute('.' + this.cid);
		};

		// Расширяем прототип коллекции в _Backbone.js_
		// -------------
		// 
		// Метод который делает вызовы метода `model.toReqJSON()` у всех содержащихся моделей 
		Backbone.Collection.prototype.toReqJSON = function(method, options) {
			var data = this.map(function(model) {
					return model.toReqJSON(method, options);
				});

			if (typeof (this.processRequestData) === 'function') {
				return this.processRequestData(data, method, options);
			}
			return [];
		};

		// Метод который можно переопределять в конкретной модели для дополнительной постобработки 
		// обработки данных для отправки на сервис в зависимости от метода запроса
		Backbone.Collection.prototype.processRequestData = function(data) {
			return data;
		};

		// Расширяем метод `_removeReference` чтоб при удалении модели вычищались все события 
		// из `core.observatory` с ней связанные.
		Backbone.Collection.prototype._removeReference = (function(fn) {
			return function(model) {
				if (model.cid) {
					this.core.observatory.off('.' + model.cid);
				}
				return fn.apply(this, arguments);
			};
		})(Backbone.Collection.prototype._removeReference);

		// Расширяем прототип _Backbone.History_
		// -------------
		// 
		Backbone.History.prototype.start = (function(fn) {
			return function(options) {
				// Переносим значение параметра core в текущий инстанс истории
				if (options.core != null) {
					this.core = options.core;
					delete options.core;
				}
				return fn.apply(this, arguments);
			};
		})(Backbone.History.prototype.start);

		// После смены роута будет выстреливать событие об окончании смены роута
		Backbone.History.prototype.loadUrl = (function(fn) {
			return function() {
				var returnData = fn.apply(this, arguments);

				// Тригерим событие об изменении роута передавай в параметрах предыдущий и текущий роут
				this.core.router.trigger('route:after_change', this.core.router.prevRoute, this.core.router.currentRoute);
				return returnData;
			};
		})(Backbone.History.prototype.loadUrl);

		// Расширяем прототип роутера в _Backbone.js_
		// -------------
		// 
		// Добавляем префикс `#!/` в выставляемый _url_ и тригерим событие об изменении роута
		Backbone.Router.prototype.navigate = function(fragment, options) {
			var section = this.core.getHashUrl().section;

			// Делаем предобработку фрагмента вырезая из него хешбэнг если он был передан
			fragment = fragment.replace(/^#!\/(.*)$/, '$1');
			section || (section = fragment);

			// Сохраняем выставляемый роут в переменную хранящую последний изменяемый роут
			this.latestFragment = fragment;

			// Вызываем изменение роута
			this.core.Backbone.history.navigate('!/' + fragment, options);

			// Если выставляемый роут соотвествует последнему изменяемому роуту, то тригерим событие о 
			// начале изменения роута.  
			// В противном случае в процессе изменения роута было произведено еще одно изменение и текущее 
			// событие уже не актуально, по этому мы его игнорируем.
			if (fragment == this.latestFragment) {
				this.trigger('route:before_change', this.currentRoute, section);

				// Сохраняем новые значения предыдущего и текущего роута
				this.prevRoute = this.currentRoute;
				this.currentRoute = section;
			}
		};

		// Добавляем обработку префикса `#!/`.  
		// Так же обрабатываем ситуацию со слешем на конце урла и в случае его присутсвия добавяем спец 
		// регулярку благодоря которой роуты оканчивающиеся на `/` будут равносильны тем что не 
		// заканчиваются слешем.
		Backbone.Router.prototype._routeToRegExp = function(route) {
			var hasSlash = NO;

			if (this.lastSlashCheck && this.lastSlashCheck.test(route)) {
				route = route.substr(0, route.length - 1);
				hasSlash = YES;
			}
			route = route
				.replace(this.escapeRegExp, '\\$&')
				.replace(this.namedParam, '([^\/]+)')
				.replace(this.splatParam, '(.*?)');
			return new RegExp('^(?:!\/)?\/?' + route + (hasSlash ? '\/?$' : '$'));
		};
	}
};
