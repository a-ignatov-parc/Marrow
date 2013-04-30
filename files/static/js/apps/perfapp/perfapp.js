window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			// Загружаем файл для генерации тестовых условий
			this._loader(['files/amplify.js', 'files/test.js'], this.bind(function() {
				var Doc = function() {
						var container = $('.l-wrapper'),
							target = container;

						this.write = function(str) {
							target.append(str);
						}

						this.set = function(title) {
							target = $('<div class="b-info">')
								.appendTo(container)
								.append('<h2>' + (title || '') + '</h2>');
						}

						this.reset = function() {
							target = container;
						}
					},
					doc = new Doc(),
					perf = new this.Perf(),
					jqPubSub = $({}),
					observers = [{
						name: 'Marrow.Observatory',
						observer: this.observatory
					}, {
						name: 'AmplifyJS PUB/SUB',
						observer: {
							on: function(name, handler, context) {
								amplify.subscribe(name, context, handler);
							},
							off: function(name) {
								amplify.unsubscribe(name);
							},
							trigger: function(name) {
								amplify.publish(name);
							}
						}
					}, {
						name: 'jQuery Events',
						observer: {
							on: function(name, handler, context) {
								jqPubSub.on(name, $.proxy(handler, context));
							},
							off: function(name) {
								jqPubSub.off(name);
							},
							trigger: function(name) {
								jqPubSub.trigger(name);
							}
						}
					}],
					testParams = [[10, 10, 10], [100, 10, 10], [10, 100, 10], [10, 10, 100]],
					run = function runNext(observer, params) {
						var testBundle,
							param;

						if (!observer) {
							observer = observers.shift();
							doc.set('Testing: ' + observer.name);
						}
						params || (params = testParams.slice(0));
						param = params.shift();

						doc.write('Testing with params: ' + param.join(', ') + ' (' + (testParams.length - params.length) + ' / ' + testParams.length + ')<br>');

						setTimeout(function() {
							testBundle = new Test(observer.observer, param[0], param[1], param[2]);

							perf.start();
							testBundle.bind();
							doc.write('– Events binding completed in: <strong>' + perf.end() + '</strong> ms.<br>');

							perf.start();
							testBundle.trigger();
							doc.write('– Events triggering completed in: <strong>' + perf.end() + '</strong> ms.<br>');

							perf.start();
							testBundle.remove();
							doc.write('– Events unbinding completed in: <strong>' + perf.end() + '</strong> ms.<br><br>');

							setTimeout(function() {
								if (params.length) {
									runNext(observer, params);
								} else {
									doc.write('<h3>Testing ' + observer.name + ' finished!</h3>');

									if (observers.length) {
										runNext();
									} else {
										doc.reset();
										alert('All tests are finished');
									}
								}
							}, 100);
						}, 100);
					};

				// Запускаем тестирование
				run();
			}, this), YES);
		}
	}, options);
};