App.Helpers.push(function(Handlebars, utils) {
	var photo = utils.templates.photo,
		switcher = utils.templates.switcher,
		infoPhoto = utils.templates.infoPhoto;

	if (photo) {
		Handlebars.registerHelper('photo', function(data, options) {
			data || (data = {});
			options || (options = {});

			for (var key in options.hash) {
				if (options.hash.hasOwnProperty(key)) {
					data[key] = options.hash[key];
				}
			}

			// Для унификации работы с шаблоном прокидываем объект position в основной объект
			if (data.position != null) {
				for (key in data.position) {
					if (data.position.hasOwnProperty(key)) {
						data[key] = data.position[key];
					}
				}
			}

			// Добавление обработки итеративных классов для ускорения выборок DOM элементов с кешированием
			if (data.iterateClass != null) {
				if (typeof(data.className) !== 'string') {
					options.hash.className = '';
				}
				data.className += ' b-photo-id' + data.id;
			}
			return new Handlebars.SafeString(photo(data));
		});
	}

	if (switcher) {
		Handlebars.registerHelper('switcher', function(data) {
			return new Handlebars.SafeString(switcher(data));
		});
	}

	if (infoPhoto) {
		Handlebars.registerHelper('infoPhoto', function(data) {
			return new Handlebars.SafeString(infoPhoto(data));
		});
	}
});