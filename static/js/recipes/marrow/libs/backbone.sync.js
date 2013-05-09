Backbone.sync = (function() {
	var methodMap = {
			'create': 'POST',
			'update': 'POST',
			'delete': 'POST',
			'read': 'GET'
		},

		// Метод `getValue` отличается от того что присутвует в Backbone.js тем что может принимать 
		// третьим аргументом один параметр, который нужно передать в функцию если получаемое значение 
		// хранится не как строка
		getValue = function (object, prop, param) {
			if (!(object && object[prop])) return null;
			return _.isFunction(object[prop]) ? object[prop](param) : object[prop];
		},
		urlError = function () {
			throw new Error('A "url" property or function must be specified');
		};

	return function (method, model, options) {
		// Если вдруг `Backbone.sync` был вызван вне песочницы, то выходим из метода
		if (!this.core || !model) {
			return;
		}

		var abortReqFlag = method == 'abort',
			type = methodMap[method],
			$ = this.core.sandbox.$,
			params = {
				type: type,
				dataType: 'json'
			},
			modelUrlParams,
			modelParams,
			urlParams,
			req;

		if (typeof(model.toReqJSON) === 'function') {
			modelParams = model.toReqJSON(method, options);
		}

		// Если в качестве параметров вернулось булевое значение `false`, то выходим и обрываем текущий запрос
		if (modelParams === NO) {
			return;
		}

		// Default options, unless specified.
		options || (options = {});

		// Проверяем есть ли в источнике данных кеш запросов, если нет, то создаем
		model.__ajaxReq || (model.__ajaxReq = []);

		// Если у нас вызван `Backbone.sync` с методом `abort` или в опциях передан параметр `abortPrevReq`, то 
		// для указанной модели мы обрываем все активные запросы и вычищаем коллекцию уже сделанных 
		// запросов
		if (abortReqFlag || options.abortPrevReq) {
			// Если у модели/коллекции есть метод `abortAjax`, а он скорее всего есть, то вызываем его и 
			// обрываем все предыдущие запросы с очисткой кеша запросов.
			if (typeof(model.abortAjax) === 'function') {
				model.abortAjax();
			}

			// Если `Backbone.sync` с методом `abort`, то нет нужды продолжать и мы выходим из метода
			if (abortReqFlag) {
				return;
			}
		}

		// Ensure that we have a URL.
		if (!options.url) {
			params.url = getValue(model, 'url', method) || urlError();
		}

		// Если мы делаем запрос фетчем то полученные данные в `modelParams` добавляем к урлу.
		if (method == 'read') {
			urlParams = params.url.split('?');
			modelUrlParams = $.param(modelParams) + (urlParams[1] ? '&' + urlParams[1] : '');

			if (modelUrlParams) {
				urlParams.push(modelUrlParams);
			}
			params.url = urlParams.join('?');

			// Переопределяем метод `success` для добавления события `receive` аналогичное событию sync только 
			// для метода `fetch`
			options.success = (function(fn, model, options) {
				return function(resp, status, xhr) {
					var data = fn.apply(this, arguments);

					model.trigger('receive', model, resp, options);
					return data;
				}
			})(options.success, model, options);
		} else {
			// Ensure that we have the appropriate request data.
			if (!options.data && model) {
				params.contentType = 'application/json';
				params.data = JSON.stringify(modelParams);
			}
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (this.core.Backbone.emulateJSON) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = params.data ? {
				model: params.data
			} : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (this.core.Backbone.emulateHTTP) {
			if (type === 'PUT' || type === 'DELETE') {
				if (this.core.Backbone.emulateJSON) params.data._method = type;
				params.type = 'POST';
				params.beforeSend = function (xhr) {
					xhr.setRequestHeader('X-HTTP-Method-Override', type);
				};
			}
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !this.core.Backbone.emulateJSON) {
			params.processData = false;
		}

		// Для того чтоб метод `parse` в источниках данных можно было как-нить кастомизировать в 
		// зависимости от типа запроса
		options.beforeSend = (function(fn) {
			return function(jqXHR, settings) {
				if (jqXHR) {
					jqXHR.syncMethod = method;
				}

				if (typeof(fn) === 'function') {
					return fn.apply(this, arguments);
				}
			};
		})(options.beforeSend);

		// Делаем обертку для обработчика `oncomplete` для того чтоб вычистить из кеша модели/коллекции 
		// отработанный ajax запрос.
		options.complete = (function(fn, model) {
			return function(jqXHR, settings) {
				model.abortAjax(jqXHR);

				if (typeof(fn) === 'function') {
					return fn.apply(this, arguments);
				}
			};
		})(options.complete, model);

		// Make the request, allowing the user to override any Ajax options.
		req = $.ajax(_.extend(params, options));
		model.__ajaxReq.push(req);
		return req;
	};
})();