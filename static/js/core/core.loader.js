// version: 0.3.1
// -------------
// 
// __История версий:__  
// 
// * `0.3.1` - Добавлена обработка секции `deferred` в списке файлов. Все файлы указанные в этой 
// секции будут загружаться после полной инициализации приложения. Если необходимо выполнить 
// какой-то код после загрузки файлов из секции deferred`, то необходимо в приложении объявить 
// метод `afterDeferred`.
// 
// * `0.3.0` - Исправлена ошибка в загрузке секции `common`. Исправлено поведении загрузчика по 
// умолчанию. Теперь при передаче `true` в качестве третьего аргумента загрузчик будет загружать 
// список файлов в основную страницу. Без него файлы будут загружаться в песочницу.
// 
// * `0.2.17` - Исправлена ошибка загрузки файлов `base.min.js` и `libs.min.js`, когда в ресурсах
// подобных секций даже нет. Рефакторинг путей для загрузки стилей.
// 
// * `0.2.16` - Исправлена работа инстанса загрузчика из приложения. Добавлена обработка случая, 
// когда путь до файла передан строкой, а не массивом. Так же исправлена ошибка, когда полностью 
// отсутсвует объект настроек.
// 
// * `0.2.15` - У классов добавлены ссылки на конструкторы + поправлена загрузка файлов ядра так, 
// как теперь все модули собираются в файл `marrow.js`. Добавлена обработка не существующего 
// атрибута `disableTransits` в объекте настроек.
// 
// * `0.2.14` - В параметры объекта `hosts` добавлена ссылка на папку `html` и исправлена ссылка 
// открываемая в `iframe` на пустой `html` документ.
// 
// * `0.2.13` - Исправлена ошибка из-за которой не работал транзит урлов в Google Chrome.
// 
// * `0.2.12` - Исправлено "просачивание" метода `define` в основную область видимости у `curl.js`.
// 
// * `0.2.11` - Добавлен патч в составлении очереди на загрузку `js` файлов. Это увеличило время 
// инициализации приложения, но зато повысило отказоустойчивость инициализации.
// 
// * `0.2.10` - В режиме дебага выводим название используемого рецепта.
// 
// * `0.2.9` - Добавлено правило указывающее на папку `libs` в папке выбранного рецепта.
// 
// * `0.2.8` - Внесение изменений в загрузчик в связи с рефакторингом `core.js` + добавлено 
// правило для загрузчика указывающее на директорию с рецептом.
// 
// * `0.2.7` - Рефакторинг апи загрузчика.
// 
// * `0.2.6` - Загрузчик дописан для работы с рецептами приложений. Для обновления списка рецептов 
// необходимо запустить таски `grunt loader` или `grunt release`.
// 
// * `0.2.5` - В загрузку добавленны скомпелированные шаблоны приложения.
// 
// * `0.2.4` - Исправлена ошибка при повторной инициализации `curl.js`.
// 
// * `0.2.3` - Замена загрузчика `yepnope.js` на `curl.js` из-за необходимости загрузки 
// кросс-доменных файлов.
// 
// * `0.2.2` - Исправлена ошибка с определением момента готовности страницы для создания песочницы.
// 
// * `0.2.1` - Исправлена ошибка с использованием не правильной ссылки на `this.options`.
// 
// * `0.2.0` - Загрузчик переделан на полную загрузку приложения в песочницу с линкованием на 
// основной документ.
// 
// Объявляем конструктор загрузчика приложений
window.WebApp || (window.WebApp = {});
window.WebApp.Loader = function(namespace, options) {
	var config = null;

	// Объявляем переменные с значениями по умолчанию
	this.options = options || {
		loadOptions: {}
	};
	this.global = window.WebApp;
	this.sandboxWindow = null;
	this.rootHost = null;
	this.loader = null;
	this.iframe = null;

	// Получаем объект настроек
	config = this.global[namespace];

	// Если указано что есть дополнительный подгружаемый конфиг то соединяем его с текущим
	if (config) {
		if (typeof(config) === 'object') {
			this.options.loadOptions || (this.options.loadOptions = {});

			for (var key in config) {
				if (config.hasOwnProperty(key)) {
					this.options.loadOptions[key] = config[key];
				}
			}
		}
	}
	this.options.namespace = namespace;
	this.options.noCache = '?no_cache=' + (+new Date());
	this.options.loadOptions.locations || (this.options.loadOptions.locations = {});
	this.options.loadOptions.disableTransits || (this.options.loadOptions.disableTransits = {});

	if (this.options.loadOptions.locations.app) {
		this.rootHost = this.options.loadOptions.locations.app;
	} else {
		this.rootHost = location.protocol + '//';
		this.rootHost += location.hostname;
		this.rootHost += location.port === '' ? '' : (':' + location.port);
		this.rootHost += '/';
	}

	this.appName = this.options.namespace;
	this.appPath = ['apps', this.appName.toLowerCase()].join('/');

	// Инициализируем рантайм загрузки и запуска веб-приложения
	this.init();
};

window.WebApp.Loader.prototype = {
	constructor: window.WebApp.Loader,

	init: function() {
		this.createDefaults();
		this.createSandbox(function(sandboxWindow) {
			this.createLoader(window, sandboxWindow);
			this.loadAppCore(sandboxWindow);
		});
	},

	createSandbox: function(callback) {
		var onLoadHandler = this.bind(function(event) {
				// Получаем и сохраняем ссылку на объект `window` в созданом `sandbox`
				this.sandboxWindow = this.iframe.contentWindow;

				// Добавляем пустой элемент `script` в `body` `iframe` для правильной работы загрузчика
				this.sandboxWindow.document.body.appendChild(document.createElement('script'));

				if (typeof(callback) === 'function') {
					callback.call(this, this.sandboxWindow);
				}
			}, this);

		this.iframe = document.createElement('iframe');
		this.iframe.style.display = 'none';

		// Из-за странного бага в Google Chrome который не позволяет выставлять хеш для iframe c урлом 
		// `javascript:0` задаем в качестве урла ссылку на пустую страницу.
		this.iframe.src = this.options.hosts.html + 'sandbox.html';
		this.iframe.tabIndex = -1;

		// Навешиваем обработчик на событие полной отрисовки _iframe_ и всего его содержимого
		if (this.iframe.addEventListener) { 
			this.iframe.addEventListener('load', onLoadHandler, false);
		} else if (this.iframe.attachEvent) { 
			this.iframe.attachEvent('onload', onLoadHandler);
		} else { 
			this.iframe.onload = onLoadHandler;
		}

		// Если не создана оснастка для обределения _DomReady_, то создаем ее
		if (!window.DomReady) {
			this.setDomReady();
		}

		if (document.readyState === 'complete') {
			document.body.appendChild(this.iframe);
		} else {
			// Навешиваем обработчик на событие _DomReady_
			DomReady.ready(this.bind(function() {
				// Вставляем созданный `iframe` в `body`
				document.body.appendChild(this.iframe);
			}, this));
		}
	},

	loadDependencies: function(window, webapp, callback) {
		var filesList = [],
			recipeFiles;

		if (!window.JSON) {
			filesList.push('system/json2.js');
		}

		if (!window.Object.keys) {
			filesList.push('system/es5-shim.min.js');
		}

		if (!window.Modernizr) {
			filesList.push('system/modernizr.min.js');
		}

		if (webapp && typeof(webapp.Dependencies) === 'function') {
			recipeFiles = webapp.Dependencies(window);

			if (recipeFiles) {
				filesList = filesList.concat(recipeFiles);
			}
		}

		// Добавляем префиксы и отправляем на загрузку
		this.loader(filesList, callback || function() {});
	},

	loadAppCore: function(sandboxWindow) {
		var appName = this.appName.toLowerCase(),
			filesList = this.options.loadOptions.resources || {},
			resources = [];

		if (this.options.debugMode) {
			resources.push(appName + '.js', 'root/marrow.js!order');
		} else {
			resources.push('build/' + appName + '.min.js', 'root/marrow.min.js!order');
		}

		// Добавляем на загрузку рецепт приложения.
		resources.push('recipe/recipe.js!order');

		if (filesList.styles) {
			// Загружаем в основную страницу необходимые стили
			this.loader(filesList.styles, true);
		}

		// Загружаем в песочницу подготовленные зависимости + файл самого приложения
		this.loader(resources, this.bind(function() {
			// После загрузки основных ресурсов и рецепта загружаем зависимости необходимые для 
			// инициализации приложения.
			this.loadDependencies(sandboxWindow || window, sandboxWindow.WebApp, this.bind(function() {
				if (filesList.common) {
					this.loader(filesList.common, this.bind(function() {
						// Переходим к инициализации веб-приложения передавая в качестве аргумента контруктор 
						// загруженное приложение.
						this.initApp(sandboxWindow.AppConstructor);
					}, this), true);
				} else {
					// Переходим к инициализации веб-приложения передавая в качестве аргумента контруктор 
					// загруженное приложение.
					this.initApp(sandboxWindow.AppConstructor);
				}
			}, this));
		}, this));
	},

	createDefaults: function() {
		var resourcesHost = this.options.loadOptions.locations.static || this.rootHost;

		this.options.rootHost = this.rootHost;
		this.options.hosts = {
			// Объект с адресами доп сервисов
			services: this.options.loadOptions.locations.services || {},

			// Url на который будет посылаться все запросы
			request: this.rootHost,

			// Url на котором будет происходить инициализация калькулятора
			init: this.options.loadOptions.locations.parent || this.rootHost,
			js: resourcesHost + 'static/js/',
			img: resourcesHost + 'static/img/',
			html: resourcesHost + 'static/html/',
			css: resourcesHost + 'static/styles/css/'
		};
		this.options.strictMode = this.options.loadOptions.strictMode;
		this.options.debugMode = this.options.loadOptions.debugMode;
	},

	initApp: function(App) {
		var Recipe = this.sandboxWindow.WebApp.Recipe,
			Core = this.sandboxWindow.WebApp.Core,
			complete = this.bind(function() {
				var callback = null;

				// Инициализируем веб-приложение так же создавая глобальную ссылку на него в объекте `window`
				window[this.appName + (window[this.appName] ? this.sandboxWindow.App.generateId() : '')] = this.sandboxWindow.App.init(this.options.bootstrapData);

				// Если в списке ресурсов обнаружена секция `deferred`, то ее мы загружаем после инициализации 
				// приложения.  
				// В качестве колбека пытаемся получить метод `afterDeferred`, если он не будет объявлен, то 
				// файлы будут загружены без уведомления о завершении загрузки.
				if (filesList && filesList.deferred) {
					if (typeof(this.sandboxWindow.App.afterDeferred) === 'function') {
						callback = this.sandboxWindow.App.afterDeferred;
					}
					this.loader(filesList.deferred, this.bind(callback, this.sandboxWindow.App));
				}
			}, this),
			filesList = this.options.loadOptions.resources,
			resources = [];

		// Указываем у конструктора `App` в качестве прототипа инстанс `Core`
		Recipe.prototype = new Core(this.sandboxWindow.WebApp, window, this.sandboxWindow);

		// Указываем в качестве прототипа нашего приложение инстан класса `App`
		App.prototype = new Recipe(this.sandboxWindow.WebApp, window, this.sandboxWindow, this.options);

		// Создаем инстанс веб-приложения и расширяем прототип веб-приложения кастомными методами 
		// специально для конкретного приложения
		this.sandboxWindow.App = new App(this.options);

		// После создания инстанса веб-приложения загружаем оставшиеся ресурсы
		if (filesList) {
			if (this.options.debugMode) {
				if (filesList.sandbox) {
					resources = filesList.sandbox.concat(resources);
				}

				if (filesList.helpers) {
					resources = resources.concat(filesList.helpers);
				}

				if (filesList.app) {
					resources = resources.concat(filesList.app);
				}
			} else {
				// Проверяем если в списке файлов присутсвует раздел `sandbox` и/или `helpers`, то загружаем 
				// пожатый комулятивный файл `libs.min.js`.
				if (filesList.sandbox || filesList.helpers) {
					resources.push('build/libs.min.js');
				}

				// Проверяем если в списке файлов присутсвует раздел `app` , то загружаем пожатый комулятивный 
				// файл `base.min.js`.
				if (filesList.app) {
					resources.push('build/base.min.js');
				}
			}
		}

		// Добавляем префиксы и отправляем на загрузку
		this.loader(resources, complete);
	},

	setPrefixes: function(resources) {
		if (typeof(resources) === 'string') {
			resources = [resources];
		}

		for (var i = 0, length = resources.length; i < length; i++) {
			if (resources[i].indexOf('.js') >= 0) {
				resources[i] = 'js!' + resources[i];

				// Форсированно добавляем постфикс `!order` ко всем `js` файлам, так как без него слишком 
				// большой процент загрузки файлов в не правлиьном порядке.
				// 
				// [TODO] Разобраться в правильном использовании постфикса `!order`.
				if (resources[i].indexOf('!order') < 0) {
					resources[i] += '!order';
				}
			} else if (resources[i].indexOf('.css') >= 0) {
				resources[i] = 'link!' + resources[i];
			}
		}
		return resources;
	},

	createLoader: function(window, sandbox) {
		var self = this,
			appName = this.appName.toLowerCase(),
			globalScope = this.createLoaderInstance(window),
			sandboxScope = this.createLoaderInstance(sandbox);

		// После инициализации `curl.js` мы создаем обстрактный объект-загрузчик с которым и будем работать
		this.loader = (function(sandbox, global) {
			// Определяем рецепт который будет использоваться приложением. Если рецепт в опциях небыл 
			// передан, то используется рецепт по умолчанию: `simple`.
			var recipe = self.options.loadOptions.recipe || 'simple';

			// В режиме дебага выводим название используемого рецепта, так как иногда можно про него 
			// забыть и долго мучаться.
			if (self.options.debugMode) {
				console.info('Using recipe: ' + recipe);
			}

			// Возвращаем кастомный унифицированный обработчик
			return function(needs, callback, loadToMainPage) {
				// Добавляем необходимые префиксы
				needs = self.setPrefixes(needs);

				// Обрабатываем ситуацию, когда список файлов необходимо загрузить в основную страницу и при 
				// этом не передан обработчик завершения загрузки.
				if (typeof(callback) === 'boolean' && arguments.length === 2) {
					loadToMainPage = callback;
					callback = null;
				}

				if (!loadToMainPage) {
					sandbox.curl.call(sandbox, {
						baseUrl: self.options.hosts.js + self.appPath,
						paths: {
							'root': self.options.hosts.js,
							'core': self.options.hosts.js + 'core',
							'system': self.options.hosts.js + 'libs',
							'recipes': self.options.hosts.js + 'recipes',
							'helpers': self.options.hosts.js + 'helpers',

							// Создаем правило указывающее на папку текущего рецепта.
							'recipe': self.options.hosts.js + 'recipes/' + recipe,

							// Создаем правило указывающее на папку библиотек текущего текущего рецепта.
							'recipe_libs': self.options.hosts.js + 'recipes/' + recipe + '/libs'
						}
					}, needs, callback);
				} else {
					global.curl.call(global, {
						baseUrl: self.options.hosts.js,
						paths: {
							'system': self.options.hosts.js + 'libs',
							'styles': self.options.hosts.css + 'global',
							'styles/app': self.options.hosts.css + appName
						}
					}, needs, callback);
				}
			};
		})(sandboxScope, globalScope);

		// Проставляем в инстансе веб-приложения ссылку на личный загрузчик приложения
		this.options._loader = this.loader;
	},

	createLoaderInstance: function(scope) {
		if (!scope.curl) {
			// Инициализируем минифицированную версию `curl.js` версии `0.7.3` с подключенными 
			// плугинами: `js`, `css`, `link` передавая ему вместо в качестве контекста ссылку на песочницу
			// https://github.com/cujojs/curl
			(function(){var h=!0,n=!1,q=this.window||"undefined"!=typeof global&&global||this;function r(){}function t(a,b){return 0==aa.call(a).indexOf("[object "+b)}function u(a){return a&&"/"==a.charAt(a.length-1)?a.substr(0,a.length-1):a}function ba(a,b){var d,c,e,f;d=1;c=a;"."==c.charAt(0)&&(e=h,c=c.replace(ca,function(a,b,c,e){c&&d++;return e||""}));if(e){e=b.split("/");f=e.length-d;if(0>f)return a;e.splice(f,d);return e.concat(c||[]).join("/")}return c}
function w(a){var b=a.indexOf("!");return{l:a.substr(b+1),j:0<=b&&a.substr(0,b)}}function y(){}function z(a,b){y.prototype=a||A;var d=new y;y.prototype=A;for(var c in b)d[c]=b[c];return d}
function B(){function a(a,b,d){c.push([a,b,d])}function b(a,b){for(var d,e=0;d=c[e++];)(d=d[a])&&d(b)}var d,c,e;d=this;c=[];e=function(d,g){a=d?function(a){a&&a(g)}:function(a,b){b&&b(g)};e=r;b(d?0:1,g);b=r;c=D};this.z=function(b,c,d){a(b,c,d)};this.g=function(a){d.w=a;e(h,a)};this.d=function(a){d.oa=a;e(n,a)};this.t=function(a){b(2,a)}}function E(a,b,d,c){a instanceof B?a.z(b,d,c):b(a)}function F(a,b,d){var c;return function(){0<=--a&&b&&(c=b.apply(D,arguments));0==a&&d&&d(c);return c}}
function G(){var a=[].slice.call(arguments),b;t(a[0],"Object")&&(b=a.shift(),H(b));return new da(a[0],a[1],a[2])}function H(a){a&&(I.P(a),J=I.b(a),I.S(a),"main"in a&&setTimeout(function(){var b;b=I.f(J,D,[].concat(a.main));I.h(b)},0))}function da(a,b,d,c){var e;e=I.f(J,D,[].concat(a));this.then=a=function(a,b){E(e,function(b){a&&a.apply(D,b)},function(a){if(b)b(a);else throw a;});return this};this.next=function(a,b,c){return new da(a,b,c,e)};this.config=H;(b||d)&&a(b,d);E(c,function(){I.h(e)})}
function ea(a){var b,d;b=a.id;if(b==D)if(K!==D)K={F:"Multiple anonymous defines in url"};else if(!(b=I.ba()))K=a;if(b!=D){d=L[b];b in L||(d=I.k(b,J),d=I.B(d.b,b),L[b]=d);if(!(d instanceof B))throw Error("duplicate define: "+b);d.ga=n;I.C(d,a)}}function M(){var a=I.Z(arguments);ea(a)}
var J,N,O,P=q.document,Q=P&&(P.head||P.getElementsByTagName("head")[0]),fa=Q&&Q.getElementsByTagName("base")[0]||null,ia={},ja={},R={},ka="addEventListener"in q?{}:{loaded:1,complete:1},A={},aa=A.toString,D,L={},S={},T=n,K,la=/^\/|^[^:]+:\/\//,ca=/(\.)(\.?)(?:$|\/([^\.\/]+.*)?)/g,ma=/\/\*[\s\S]*?\*\/|(?:[^\\])\/\/.*?[\n\r]/g,na=/require\s*\(\s*["']([^"']+)["']\s*\)|(?:[^\\]?)(["'])/g,U,I;
I={m:function(a,b,d){var c;a=ba(a,b);if("."==a.charAt(0))return a;c=w(a);a=(b=c.j)||c.l;a in d.c&&(a=d.c[a].K||a);b&&(0>b.indexOf("/")&&!(b in d.c)&&(a=u(d.N)+"/"+b),a=a+"!"+c.l);return a},f:function(a,b,d,c){function e(b){return I.m(b,g.id,a)}function f(b,d,f){var j;j=d&&function(a){d.apply(D,a)};if(t(b,"String")){if(j)throw Error("require(id, callback) not allowed");f=e(b);b=L[f];if(!(f in L))throw Error("Module not resolved: "+f);return(f=b instanceof B&&b.a)||b}E(I.h(I.f(a,g.id,b,c)),j,f)}var g;
g=new B;g.id=b||"";g.ca=c;g.D=d;g.b=a;g.u=f;f.toUrl=function(b){return I.k(e(b),a).url};g.m=e;return g},B:function(a,b,d){var c,e,f;c=I.f(a,b,D,d);e=c.g;f=F(1,function(a){c.p=a;try{return I.V(c)}catch(b){c.d(b)}});c.g=function(a){E(d||T,function(){e(L[c.id]=S[c.url]=f(a))})};c.G=function(a){E(d||T,function(){c.a&&(f(a),c.t(ja))})};return c},T:function(a,b,d,c){return I.f(a,d,D,c)},aa:function(a){return a.u},H:function(a){return a.a||(a.a={})},$:function(a){var b=a.q;b||(b=a.q={id:a.id,uri:I.I(a),
exports:I.H(a),config:function(){return a.b}},b.a=b.exports);return b},I:function(a){return a.url||(a.url=I.A(a.u.toUrl(a.id),a.b))},P:function(a){var b,d,c,e,f;b="curl";d="curlDefine";c=e=q;if(a&&(f=a.overwriteApi||a.ma,b=a.apiName||a.ia||b,c=a.apiContext||a.ha||c,d=a.defineName||a.ka||d,e=a.defineContext||a.ja||e,N&&t(N,"Function")&&(q.curl=N),N=null,O&&t(O,"Function")&&(q.define=O),O=null,!f)){if(c[b]&&c[b]!=G)throw Error(b+" already exists");if(e[d]&&e[d]!=M)throw Error(d+" already exists");}c[b]=
G;e[d]=M},b:function(a){function b(a,b){var c,d,g,s,v;for(v in a){g=a[v];t(g,"String")&&(g={path:a[v]});g.name=g.name||v;s=e;d=w(u(g.name));c=d.l;if(d=d.j)s=f[d],s||(s=f[d]=z(e),s.c=z(e.c),s.e=[]),delete a[v];if(b){d=g;var x=void 0;d.path=u(d.path||d.location||"");x=d.main||"./main";"."==x.charAt(0)||(x="./"+x);d.K=ba(x,d.name+"/");d.b=d.config;d.b&&(d.b=z(e,d.b))}else d={path:u(g.path)};d.Q=c.split("/").length;c?(s.c[c]=d,s.e.push(c)):s.n=I.O(g.path,e)}}function d(a){var b=a.c;a.M=RegExp("^("+a.e.sort(function(a,
c){return b[c].Q-b[a].Q}).join("|").replace(/\/|\./g,"\\$&")+")(?=\\/|$)");delete a.e}var c,e,f,g;"baseUrl"in a&&(a.n=a.baseUrl);"main"in a&&(a.K=a.main);"preloads"in a&&(a.na=a.preloads);"pluginPath"in a&&(a.N=a.pluginPath);if("dontAddFileExt"in a||a.i)a.i=RegExp(a.dontAddFileExt||a.i);c=J;e=z(c,a);e.c=z(c.c);f=a.plugins||{};e.plugins=z(c.plugins);e.s=z(c.s,a.s);e.r=z(c.r,a.r);e.e=[];b(a.packages,h);b(a.paths,n);for(g in f)a=I.m(g+"!","",e),e.plugins[a.substr(0,a.length-1)]=f[g];f=e.plugins;for(g in f)if(f[g]=
z(e,f[g]),a=f[g].e)f[g].e=a.concat(e.e),d(f[g]);for(g in c.c)e.c.hasOwnProperty(g)||e.e.push(g);d(e);return e},S:function(a){var b;(b=a&&a.preloads)&&0<b.length&&E(T,function(){T=I.h(I.f(J,D,b,h))})},k:function(a,b){var d,c,e,f;d=b.c;e=la.test(a)?a:a.replace(b.M,function(a){c=d[a]||{};f=c.b;return c.path||""});return{b:f||J,url:I.O(e,b)}},O:function(a,b){var d=b.n;return d&&!la.test(a)?u(d)+"/"+a:a},A:function(a,b){return a+((b||J).i.test(a)?"":".js")},J:function(a,b,d){var c=P.createElement("script");
c.onload=c.onreadystatechange=function(d){d=d||q.event;if("load"==d.type||ka[c.readyState])delete R[a.id],c.onload=c.onreadystatechange=c.onerror="",b()};c.onerror=function(){d(Error("Syntax or http error: "+a.url))};c.type=a.L||"text/javascript";c.charset="utf-8";c.async=!a.da;c.src=a.url;R[a.id]=c;Q.insertBefore(c,fa);return c},W:function(a){var b=[],d;("string"==typeof a?a:a.toSource?a.toSource():a.toString()).replace(ma,"").replace(na,function(a,e,f){f?d=d==f?D:d:d||b.push(e);return""});return b},
Z:function(a){var b,d,c,e,f,g;f=a.length;c=a[f-1];e=t(c,"Function")?c.length:-1;2==f?t(a[0],"Array")?d=a[0]:b=a[0]:3==f&&(b=a[0],d=a[1]);!d&&0<e&&(g=h,d=["require","exports","module"].slice(0,e).concat(I.W(c)));return{id:b,p:d||[],v:0<=e?c:function(){return c},o:g}},V:function(a){var b;b=a.v.apply(a.o?a.a:D,a.p);b===D&&a.a&&(b=a.q?a.a=a.q.a:a.a);return b},C:function(a,b){a.v=b.v;a.o=b.o;a.D=b.p;I.h(a)},h:function(a){function b(a,b,d){g[b]=a;d&&l(a,b)}function d(b,d){var c,e,f,g;c=F(1,function(a){e(a);
j(a,d)});e=F(1,function(a){l(a,d)});f=I.X(b,a);(g=f instanceof B&&f.a)&&e(g);E(f,c,a.d,a.a&&function(a){f.a&&(a==ia?e(f.a):a==ja&&c(f.a))})}function c(){a.g(g)}var e,f,g,k,p,l,j;g=[];f=a.D;k=f.length;0==f.length&&c();l=F(k,b,function(){a.G&&a.G(g)});j=F(k,b,c);for(e=0;e<k;e++)p=f[e],p in U?(j(U[p](a),e,h),a.a&&a.t(ia)):p?d(p,e):j(D,e,h);return a},Y:function(a){I.I(a);I.J(a,function(){var b=K;K=D;a.ga!==n&&(!b||b.F?a.d(Error(b&&b.F||"define() missing or duplicated: "+a.url)):I.C(a,b))},a.d);return a},
X:function(a,b){var d,c,e,f,g,k,p,l,j,m,s;d=b.m;c=b.ca;e=b.b||J;f=w(d(a));p=f.l;g=f.j||p;l=I.k(g,e);if(f.j)k=g;else if(k=l.b.moduleLoader||l.b.la)p=g,g=k,l=I.k(k,e);g in L?j=L[g]:l.url in S?j=L[g]=S[l.url]:(j=I.B(l.b,g,c),j.url=I.A(l.url,l.b),L[g]=S[l.url]=j,I.Y(j));g==k&&(m=new B,s=e.plugins[k]||e,E(j,function(a){var b,e,f;f=a.dynamic;p="normalize"in a?a.normalize(p,d,j.b)||"":d(p);e=k+"!"+p;b=L[e];if(!(e in L)){b=I.T(s,e,p,c);f||(L[e]=b);var g=function(a){b.g(a);f||(L[e]=a)};g.resolve=g;g.reject=
g.error=b.d;a.load(p,b.u,g,s)}m!=b&&E(b,m.g,m.d,m.t)},m.d));return m||j},ba:function(){var a;if(!t(q.opera,"Opera"))for(var b in R)if("interactive"==R[b].readyState){a=b;break}return a}};U={require:I.aa,exports:I.H,module:I.$};G.version="0.7.3";G.config=H;M.amd={plugins:h,jQuery:h,curl:"0.7.3"};J={n:"",N:"curl/plugin",i:/\?|\.js\b/,s:{},r:{},plugins:{},c:{},M:/$^/};N=q.curl;O=q.define;!N||t(N,"Function")?I.P():(q.curl=D,H(N));L.curl=G;
L["curl/_privileged"]={core:I,cache:L,config:function(){return J},_define:ea,_curl:G,Promise:B};var oa=this.document;function pa(a){try{return eval(a)}catch(b){}}
this.curlDefine("curl/plugin/js",["curl/_privileged"],function(a){function b(b,d,c){function e(){g||(f<new Date?c():setTimeout(e,10))}var f,g,k;f=(new Date).valueOf()+(b.fa||3E5);c&&b.a&&setTimeout(e,10);k=a.core.J(b,function(){g=h;b.a&&(b.w=pa(b.a));!b.a||b.w?d(k):c()},function(a){g=h;c(a)})}function d(a,c){b(a,function(){var b=e.shift();k=0<e.length;b&&d.apply(null,b);c.g(a.w||h)},function(a){c.d(a)})}var c={},e=[],f=oa&&oa.createElement("script").async==h,g,k;g=a.Promise;return{dynamic:h,normalize:function(a,
b){var c=a.indexOf("!");return 0<=c?b(a.substr(0,c))+a.substr(c):b(a)},load:function(a,l,j,m){function s(a){(j.error||function(a){throw a;})(a)}var v,x,ga,ha,C;v=0<a.indexOf("!order");x=a.indexOf("!exports=");ga=0<x&&a.substr(x+9);ha="prefetch"in m?m.prefetch:h;a=v||0<x?a.substr(0,a.indexOf("!")):a;l=l.toUrl(a);C=l.lastIndexOf(".")<=l.lastIndexOf("/")?l+".js":l;C in c?c[C]instanceof g?c[C].z(j,s):j(c[C]):(a={name:a,url:C,da:v,a:ga,fa:m.timeout},c[C]=m=new g,m.z(function(a){c[C]=a;j(a)},s),v&&!f&&
k?(e.push([a,m]),ha&&(a.L="text/cache",b(a,function(a){a&&a.parentNode.removeChild(a)},function(){}),a.L="")):(k=k||v,d(a,m)))}}});var V=this.document,qa=/^\/\//,ra;V&&(ra=V.head||(V.head=V.getElementsByTagName("head")[0]));
this.curlDefine("curl/plugin/link",{load:function(a,b,d,c){a=b.toUrl(a);a=a.lastIndexOf(".")<=a.lastIndexOf("/")?a+".css":a;c=a=(c="fixSchemalessUrls"in c?c.fixSchemalessUrls:V.location.protocol)?a.replace(qa,c+"//"):a;a=V.createElement("link");a.rel="stylesheet";a.type="text/css";a.href=c;ra.appendChild(a);d(a.sheet||a.styleSheet)}});function sa(){var a;a=W[ta]("link");a.rel="stylesheet";a.type="text/css";return a}
function ua(a,b,d){va.push({url:a,R:b,U:function(){d(Error(wa))}});a=xa.shift();!a&&ya.length<za&&(a=W.createElement("style"),ya.push(a),X.appendChild(a));a&&Y(a)}function Y(a){var b,d;b=va.shift();d=a.styleSheet;b?(a.onload=function(){b.R(b.ea);Y(a)},a.onerror=function(){b.U();Y(a)},b.ea=d.imports[d.addImport(b.url)]):(a.onload=a.onerror=Z,xa.push(a))}
function Aa(a,b,d){if(!$.load){var c;var e,f;if(!a.href||W.readyState&&"complete"!=W.readyState)c=n;else{c=n;try{if(e=a.sheet)f=e.cssRules,c=null===f,!c&&f&&(e.insertRule("-curl-css-test {}",0),e.deleteRule(0),c=h)}catch(g){c="[object Opera]"!=Object.prototype.toString.call(window.opera)&&/security|denied/i.test(g.message)}}c?d(a.sheet):a.onload==Z||!a.onload||Ba(function(){Aa(a,b,d)},b)}}
function Ca(a,b,d,c){function e(){if(f.onload!=Z&&f.onload){f.onload=f.onerror=Z;var a=function(){!W.readyState||"complete"==W.readyState?b(f.sheet):Ba(a,10)};a()}}var f;f=sa();f.onload=function(){$.load=$.load||h;e()};Aa(f,c,e);f.onerror=function(){$.error=$.error||h;f.onload!=Z&&f.onload&&(f.onload=f.onerror=Z,d(Error(wa)))};f.href=a;X.appendChild(f)}function Z(){}
var ta="createElement",Ba=this.setTimeout,W=this.document,X,Da=W&&W.createStyleSheet&&!(10<=W.documentMode),ya=[],xa=[],va=[],za=12,Ea,wa="HTTP or network error.",$={};W&&(X=W.head||W.getElementsByTagName("head")[0],Ea=Da?ua:Ca);
this.curlDefine("curl/plugin/css",{normalize:function(a,b){var d,c;if(!a)return a;d=a.split(",");c=[];for(var e=0,f=d.length;e<f;e++)c.push(b(d[e]));return c.join(",")},load:function(a,b,d,c){function e(a){1<k.length&&g.push(a);0==--l&&d(1==k.length?a:g)}function f(a){(d.d||function(a){throw a;})(a)}var g,k,p,l,j;g=[];k=(a||"").split(",");p=c.cssWatchPeriod||50;c=c.cssNoWait;l=k.length;for(j=0;j<k.length;j++){a=k[j];var m;a=b.toUrl(a);a=a.lastIndexOf(".")<=a.lastIndexOf("/")?a+".css":a;c?(m=sa(),m.href=a,
X.appendChild(m),e(m.sheet||m.styleSheet)):Ea(a,e,f,p)}},"plugin-builder":"./builder/css",pluginBuilder:"./builder/css"});
}).call(scope);
		}

		// Возвращаем модифицированный `scope`
		return scope;
	},

	setDomReady: function() {
		(function(){var f,g,h;function e(){if(!d&&(d=!0,c)){for(var a=0;a<c.length;a++)c[a].call(window,[]);c=[]}}function l(a){var i=window.onload;window.onload="function"!=typeof window.onload?a:function(){i&&i();a()}}function j(){if(!k){k=!0;document.addEventListener&&!f&&document.addEventListener("DOMContentLoaded",e,!1);g&&window==top&&function(){if(!d){try{document.documentElement.doScroll("left")}catch(a){setTimeout(arguments.callee,0);return}e()}}();f&&document.addEventListener("DOMContentLoaded",
function(){if(!d){for(var a=0;a<document.styleSheets.length;a++)if(document.styleSheets[a].disabled){setTimeout(arguments.callee,0);return}e()}},!1);if(h){var a;(function(){if(!d)if("loaded"!=document.readyState&&"complete"!=document.readyState)setTimeout(arguments.callee,0);else{if(void 0===a){for(var b=document.getElementsByTagName("link"),c=0;c<b.length;c++)"stylesheet"==b[c].getAttribute("rel")&&a++;b=document.getElementsByTagName("style");a+=b.length}document.styleSheets.length!=a?setTimeout(arguments.callee,
0):e()}})()}l(e)}}var m=window.DomReady={},b=navigator.userAgent.toLowerCase();b.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/);h=/webkit/.test(b);f=/opera/.test(b);g=/msie/.test(b)&&!/opera/.test(b);/mozilla/.test(b)&&/(compatible|webkit)/.test(b);var k=!1,d=!1,c=[];m.ready=function(a){j();d?a.call(window,[]):c.push(function(){return a.call(window,[])})};j()})();
	},

	bind: function(fn, context) {
		context || (context = window);

		if (typeof(fn) === 'function') {
			return function() {
				return fn.apply(context, arguments);
			}
		}
		return NO;
	}
};