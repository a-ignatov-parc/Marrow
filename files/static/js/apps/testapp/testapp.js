window.AppConstructor = function(options) {
	_.extend(this, {
		// Кастомный обработчик ошибок с указанием режима дебага или продакшна
		errorHandler: function(message, file, lineNum) {
			if (!this.debugMode) {
				return true;
			} else {
				alert('"' + message + '" on line: ' + lineNum + ' in ' + file);
				return false;
			}
		},

		// Разбиваем число на разряды
		pritifyPrice: function(price) {
			if (!isNaN(price)) {
				price += '';

				var priceArr = price.split(/,|\./);

				if (priceArr.length > 2) {
					return NaN;
				} else {
					priceArr[1] ? (priceArr[1] = ',' + priceArr[1]) : (priceArr[1] = '');
					price = priceArr[0];

					var modulo = price.length % 3,
						first = price.substr(0, modulo),
						second = price.slice(modulo);

					return (first + second.replace(/(\d{1,3})/g, ' $1') + priceArr[1]).replace(/^\s+|\s+$/g, '');
				}
			} else {
				return price;
			}
		},

		// Метод который по число выдает правильное склонение слова из трех представленых
		getDeclension: function(num, strArr) {
			var result = '',
				modulo;

			if (num != null && strArr != null && strArr.length == 3) {
				num = Math.abs(num);
				modulo = num % 100;

				if (modulo >= 5 && modulo <= 20) {
					result = strArr[2];
				}
				modulo %= 10;

				if (modulo == 1) {
					result = strArr[0];
				}

				if (modulo >= 2 && modulo <= 4) {
					result = strArr[1];
				}
			}
			return result;
		},

		// Кроссбраузерный метод выставления курсора у инпута в самый конец текста.
		// В качестве аргумента принимается ссылка DOM элемент инпута
		placeCaretAtEnd: function(input) {
			this.placeCaretAt(input, input.value.length);
		},

		// Кроссбраузерный метод выставления курсора у инпута в указанную позицию
		// В качестве аргументов принимается ссылка DOM элемент инпута, а так же желаемая позиция
		placeCaretAt: function(input, position) {
			var selectionStart = position,
				selectionEnd = position;

			if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			} else if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		},

		// Метод реализующий предзагрузку изображений.  
		// Какие параметры могут обрабатываться в `options`
		// 
		// * `images` - (_DOM/jQuery/falsy_) Ссылка на DOM элемент картинки (`<img/>`) или на `jQuery` 
		// объект с картинками для которых нужно загрузить изображения.  
		// Если будет передан null/false/undefined, то изображение будет загружатся не привязываясь к 
		// какому либо тегу, после чего его можно будет вставить по событию. 
		// 
		// * `url` - (_string_) Ссылка на загружаемое изображение. Если этот параметр не передан, то 
		// должен быть обязательно передан метод `params.getUrl`, который в свою очередь должен возвращать 
		// ссылку на изобажение иначе загрузка изображения будет отменена.
		// 
		// Список параметров которые могут быт ьперезаны в аргументе `params`:
		// 
		// * `params.getUrl` - (_fn_) Метод, который должен возвращать ссылку на загружаемое изображение для 
		// текущей картинки.  
		// Используется если необходимо сделать загрузку множества файлов.  
		// В качестве аргументов передается ссылка на `jQuery` объект обрабатываемого `<img/>`.
		// 
		// * `params.onStart` - (_fn_) Метод, который вызывается перед началом загрузку изображения.  
		// Позволяет выполнять внутри анимация из-за чего после выполнения всех действий необходимо 
		// вызвать функцию `callback`, которая передается в параметрах иначе изображение не будет 
		// загружатся.  
		// В качестве аргументов передается ссылка на `jQuery` объект обрабатываемого `<img/>` и 
		// функция `callback`, которая продолжает операцию по загрузке изображения.
		// 
		// * `params.onLoad` - (_fn_) Метод который вызывается по завершению загрузки изображения.  
		// В качестве аргументов передается ссылка на `jQuery` объект обрабатываемого `<img/>`.
		// 
		// * `params.onError` - (_fn_) Метод который вызывается если загрузка изображения не удалась.  
		// В качестве аргументов передается ссылка на `jQuery` объект обрабатываемого `<img/>`.
		// 
		// * `params.forceLoad` - (_bool_) Параметр который указывает на то загружать новое изображение 
		// если у `DOM` элемента уже проставлен атрибут `src`.
		preloadImages: function(images, url, params) {
			images = $(images || document.createElement('img'));
			params || (params = {});

			if (!images.length || (!url && !params.getUrl)) return;

			var self = this,
				handler = function(event) {
					var img = $(this).off('.preloader');

					if (typeof(params.onLoad) === 'function') {
						params.onLoad(img);
					}
				},
				load = function(target, url, handler) {
					// Если у изображения уже есть проставленный урл и не передан парамтр для форсированный 
					// загрузки, то обрываем загрузку
					if (target.attr('src') && !params.forceLoad) {
						return;
					}

					// Выставляем изображению урл для загрузки изображения
					target.attr('src', url);

					// Если изображение загруженно, то сразу вызываем обработчик загрузки.  
					// Если нет, то навешиваем событие на загрузку изображения.
					if (target[0].complete) {
						handler.call(target[0], {});
					} else {
						target
							.on('load.preloader', handler)
							.on('error.preloader', function() {
								var img = $(this).off('.preloader');

								if (typeof(params.onError) === 'function') {
									params.onError(img);
								}
							});
					}
				},
				getImg = function(target, url, handler) {
					if (typeof(params.onStart) === 'function') {
						params.onStart(target, self.bind(function() {
							load(this.t, this.u, this.h);
						}, {
							u: url,
							t: target,
							h: handler
						}));
					} else {
						load(target, url, handler);
					}
				};

			if (typeof(url) === 'object') {
				params = url;
				url = null;
			}

			if (typeof(url) === 'string') {
				getImg(images, url, handler);
			} else {
				if (typeof(params.getUrl) === 'function') {
					for (var i = 0, length = images.length, image; i < length; i++) {
						image = images.eq(i);
						getImg(image, params.getUrl(image), handler);
					}
				}
			}
		}
	}, options);
};