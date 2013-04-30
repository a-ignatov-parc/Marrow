test('check for Marrow.Observatory is loaded', function() {
	equal(typeof(window.WebApp), 'object', 'WebApp object exists!');
	equal(typeof(window.WebApp.Observatory), 'function', 'WebApp.Observatory is function!');
});

test('init instance of Marrow.Observatory', function() {
	var observatory = new window.WebApp.Observatory();

	notEqual(observatory, null, 'observatory variable is not null!');
	equal(observatory instanceof window.WebApp.Observatory, true, 'observatory variable is instance of WebApp.Observatory!');
	equal(typeof(observatory.on), 'function', 'observatory.on is function!');
	equal(typeof(observatory.off), 'function', 'observatory.off is function!');
	equal(typeof(observatory.trigger), 'function', 'observatory.trigger is function!');
	equal(typeof(observatory.mute), 'function', 'observatory.mute is function!');
	equal(typeof(observatory.unmute), 'function', 'observatory.unmute is function!');
});

asyncTest('bind one event and trigger it', 1, function() {
	var observatory = new window.WebApp.Observatory();

	observatory.on('test', function() {
		ok(true, 'handler has been triggered');
	});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with same name', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with same name and differend namespace in one action', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1 test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with same name and differend namespace in one action', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1 test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with same name and differend namespace in one action', 1, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1 test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('.a1');
});

asyncTest('bind two events with same name and differend namespace in one action', 3, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1 test.a2 test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then trigger "test.a2" and ".a2"', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test.a2');
	observatory.trigger('.a2');
});

asyncTest('bind two events with name ".a1" and "test.a1" then trigger "test" and ".a1"', 3, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
	observatory.trigger('.a1');
});

asyncTest('bind two events with name "test" then trigger "test"', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then trigger "test" then unbind ".a2" and again trigger "test"', 3, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.trigger('test')
		.off('.a2')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then trigger "test" then mute ".a2" then trigger "test" then unmute ".a2" and finaly trigger "test"', 5, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.trigger('test')
		.mute('.a2')
		.trigger('test')
		.unmute('.a2')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then mute ".a2" then bind "test.a2" and trigger "test"', 1, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.mute('.a2')
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		})
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" then mute "test.a1" and trigger "test"', 0, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.mute('test.a1')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test.a1" trigger "test"', 1, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.off('test.a1')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind ".a1" trigger "test"', 1, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.off('.a1')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 0, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.off('test')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 3, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('test.a2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.off('.a1')
		.trigger('test')
		.on('test.a1', function() {
			ok(true, 'handler has been triggered');
		})
		.trigger('test');
});

asyncTest('bind "test" event then mute "test" trigger "test" bind "test" event, trigger test, unmute "test", trigger "test"', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.mute('test')
		.trigger('test')
		.on('test', function() {
			ok(true, 'handler has been triggered');
		})
		.trigger('test')
		.unmute('test')
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('ss:ss.test1', function() {
			ok(true, 'handler has been triggered');
		})
		.on('ss:ss.test2', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.off('zz:zz.test2')
		.trigger('ss:ss');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 1, function() {
	var observatory = new window.WebApp.Observatory(),
		handler = function() {
			ok(true, 'handler has been triggered');
		};

	observatory.on('test', handler);

	start();
	observatory
		.trigger('test')
		.off('test', handler)
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 2, function() {
	var observatory = new window.WebApp.Observatory();

	observatory
		.on('test', function() {
			ok(true, 'handler has been triggered');
		});

	start();
	observatory
		.trigger('test')
		.off('test', function() {})
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 2, function() {
	var observatory = new window.WebApp.Observatory(),
		handler = function() {
			ok(true, 'handler has been triggered');
		};

	observatory
		.on('test', handler, {
			a: 1
		});

	start();
	observatory
		.trigger('test')
		.off('test', handler, {})
		.trigger('test');
});

asyncTest('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', 1, function() {
	var observatory = new window.WebApp.Observatory(),
		handler = function() {
			ok(true, 'handler has been triggered');
		},
		context = {
			a: 1
		};

	observatory.on('test', handler, context);

	start();
	observatory
		.trigger('test')
		.off('test', handler, context)
		.trigger('test');
});

test('bind two events with name "test.a1" and "test.a2" then unbind "test" trigger "test"', function() {
	var observatory = new window.WebApp.Observatory();

	observatory.on('test', function() {
		equal(this.a, 1, 'context is ok');
	}, {
		a: 1
	});

	observatory.trigger('test');
});

test('Context works normaly between to instances of one class', function() {
	var observatory = new window.WebApp.Observatory(),
		TestClass = function() {
			var count = this.count,
				cid;

			this.cid = cid = 'c' + count;
			this.constructor.prototype.count++

			this.init = function() {
				observatory.on('test.' + this.cid, this.handler, this);
			};

			this.destroy = function() {
				observatory.off('.' + this.cid);
			};

			this.init();
		};

	TestClass.prototype = {
		constructor: TestClass,
		handler: function() {
			equal(this.cid, 'c0', 'context is ok');
		},
		count: 0
	};

	var a = new TestClass(),
		b = new TestClass();

	b.destroy();
	b = null;

	observatory.trigger('test');
});

test('Testing passing arguments in trigger method', function() {
	var observatory = new window.WebApp.Observatory(),
		args = [1, 2];

	observatory
		.on('test1', function(eventName, arg) {
			equal(eventName, 'test1', 'Event name is ok');
			equal(arg, 1, 'First argument is ok');
		})
		.on('test2', function(eventName, arg1, arg2) {
			equal(eventName, 'test2', 'Event name is ok');
			equal(arg1, args[0], 'First argument is ok');
			equal(arg2, args[1], 'Second argument is ok');
		});

	observatory
		.trigger('test1', 1)
		.trigger('test2', args);
});