App.Models.Dictionary = App.Backbone.Model.extend({
	url: function() {
		return this.core.hosts.request + 'Dictionary/Get';
	},

	getDictionary: function(name, callback, data) {
		var dictionary;

		// Если модель проинициализирована, то пытаемся получить справочник по имени
		if (this.attributes) {
			dictionary = this.get(name);
		}

		// Если справочник загружен, то выдаем его сразу же.
		// В противном случае запускаем механизм его получения
		if (dictionary) {
			if (typeof(callback) === 'function') {
				callback(name, dictionary);
			}
		} else {
			dictionary = this.core.setCollection('Dictionary');
			dictionary.name = name;
			dictionary.callback = callback;
			dictionary.on('reset', function(collection) {
				if (typeof(collection.callback) === 'function') {
					this.getDictionary(collection.name, collection.callback);
				}
				delete collection.callback;
			}, this);

			// Записываем коллекцию в модель если модель проинициализирована
			if (this.attributes) {
				this.set(name, dictionary);
			}

			// Если переданны данные для заполнения справочника, то заполняем в противном случае запускаем 
			// загрузку с сервера
			if (data) {
				dictionary.reset(data);
			} else {
				dictionary.fetch();
			}
		}
		return dictionary;
	},

	getDictionaries: function(list, callback, context) {
		var handler = function(name, data) {
				var count = 0;

				list[name](data);
				delete list[name];

				for (var listName in list) {
					if (list.hasOwnProperty(listName)) {
						count++;
					}
				}

				if (!count && typeof (callback) === 'function') {
					callback.call(context);
				}
			};

		for (var name in list) {
			if (list.hasOwnProperty(name)) {
				this.getDictionary(name, handler);
			}
		}
	},

	toJSON: (function(fn) {
		return function(options) {
			var data = fn.apply(this, arguments);

			for (var name in data) {
				if (data.hasOwnProperty(name)) {
					data[name] = data[name].toJSON();
				}
			}
			return data;
		};
	})(App.Backbone.Model.prototype.toJSON),

	parse: function(response, xhr) {
		if (response && !response.Result) {
			for (var name in response) {
				if (response.hasOwnProperty(name)) {
					response[name] = this.getDictionary(name, null, response[name]);
				}
			}
			return response;
		}
	}
});