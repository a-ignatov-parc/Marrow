/* jshint -W015 */
/* jshint -W014 */
/* jshint -W069 */
/* jshint -W098 */
/* jshint -W109 */
/* jshint -W117 */
var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["App"] = this["App"] || {};
this["App"]["Templates"] = this["App"]["Templates"] || {};

this["App"]["Templates"]["app"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n	<section id=\"main\">\n		<input id=\"toggle-all\" type=\"checkbox\">\n		<label for=\"toggle-all\">Mark all as complete</label>\n		";
  options = {hash:{
    'item-view': ("todo-item"),
    'tag': ("ul"),
    'id': ("todo-list")
  },inverse:self.noop,fn:self.program(2, program2, data),data:data};
  stack2 = ((stack1 = helpers.collection || depth0.collection),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "collection", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</section>\n	";
  options = {hash:{
    'tag': ("footer"),
    'id': ("footer")
  },data:data};
  buffer += escapeExpression(((stack1 = helpers.view || depth0.view),stack1 ? stack1.call(depth0, "stats", options) : helperMissing.call(depth0, "view", "stats", options)))
    + "\n	";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n		<div class=\"view\">\n			<input class=\"toggle\" type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, depth0.completed, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n			<label>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</label>\n			<button class=\"destroy\"></button>\n		</div>\n		<input class=\"edit\" value=\"";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n		";
  return buffer;
  }
function program3(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

  buffer += "<section id=\"todoapp\">\n	<header id=\"header\">\n		<h1>todos</h1>\n		<input id=\"new-todo\" placeholder=\"What needs to be done?\" autofocus>\n	</header>\n	";
  options = {hash:{},inverse:self.program(1, program1, data),fn:self.noop,data:data};
  stack2 = ((stack1 = helpers.empty || depth0.empty),stack1 ? stack1.call(depth0, depth0.collection, options) : helperMissing.call(depth0, "empty", depth0.collection, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</section>\n<div id=\"info\">\n	<p>Double-click to edit a todo</p>\n	<p>Written by <a href=\"https://github.com/addyosmani\">Addy Osmani</a> &amp; <a href=\"https://github.com/eastridge\">Ryan Eastridge</a></p>\n	<p>Part of <a href=\"http://todomvc.com\">TodoMVC</a></p>\n</div>";
  return buffer;
  });

this["App"]["Templates"]["stats"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "All";
  }

function program3(depth0,data) {
  
  
  return "Active";
  }

function program5(depth0,data) {
  
  
  return "Completed";
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n<button id=\"clear-completed\">Clear completed (";
  if (stack1 = helpers.completed) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.completed; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + ")</button>\n";
  return buffer;
  }

  buffer += "<span id=\"todo-count\"><strong>";
  if (stack1 = helpers.remaining) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.remaining; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong> ";
  if (stack1 = helpers.itemText) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.itemText; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " left</span>\n<ul id=\"filters\">\n	<li>\n		";
  options = {hash:{
    'class': ("selected")
  },inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.link || depth0.link),stack1 ? stack1.call(depth0, "/", options) : helperMissing.call(depth0, "link", "/", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</li>\n	<li>\n		";
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.link || depth0.link),stack1 ? stack1.call(depth0, "/active", options) : helperMissing.call(depth0, "link", "/active", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</li>\n	<li>\n		";
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data};
  stack2 = ((stack1 = helpers.link || depth0.link),stack1 ? stack1.call(depth0, "/completed", options) : helperMissing.call(depth0, "link", "/completed", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</li>\n</ul>\n";
  stack2 = helpers['if'].call(depth0, depth0.completed, {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  return buffer;
  });

if (typeof exports === 'object' && exports) {module.exports = this["App"]["Templates"];}
/*global Thorax*/
(function () {
	'use strict';

	// Todo Model
	// ----------

	// Our basic **Todo** model has `title`, `order`, and `completed` attributes.
	window.app.Todo = Thorax.Model.extend({

		// Default attributes for the todo
		// and ensure that each todo created has `title` and `completed` keys.
		defaults: {
			title: '',
			completed: false
		},

		// Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed')
			});
		},

		isVisible: function () {
			var isCompleted = this.get('completed');
			if (window.app.TodoFilter === '') {
				return true;
			} else if (window.app.TodoFilter === 'completed') {
				return isCompleted;
			} else if (window.app.TodoFilter === 'active') {
				return !isCompleted;
			}
		}

	});

}());

/*global Thorax, Store*/
(function () {
	'use strict';

	// Todo Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	var TodoList = Thorax.Collection.extend({

		// Reference to this collection's model.
		model: window.app.Todo,

		// Save all of the todo items under the `"todos"` namespace.
		localStorage: new Store('todos-backbone-thorax'),

		// Filter down the list of all todo items that are finished.
		completed: function () {
			return this.filter(function (todo) {
				return todo.get('completed');
			});
		},

		// Filter down the list to only todo items that are still not finished.
		remaining: function () {
			return this.without.apply(this, this.completed());
		},

		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		nextOrder: function () {
			if (!this.length) {
				return 1;
			}
			return this.last().get('order') + 1;
		},

		// Todos are sorted by their original insertion order.
		comparator: function (todo) {
			return todo.get('order');
		}
	});

	// Create our global collection of **Todos**.
	window.app.Todos = new TodoList();

	// Ensure that we always have data available
	window.app.Todos.fetch();

}());

/*global Thorax, ENTER_KEY*/
(function () {
	'use strict';

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	Thorax.View.extend({

		//... is a list tag.
		tagName:  'li',

		// Cache the template function for a single item.
		name: 'todo-item',

		// The DOM events specific to an item.
		events: {
			'click .toggle':	'toggleCompleted',
			'dblclick label':	'edit',
			'click .destroy':	'clear',
			'keypress .edit':	'updateOnEnter',
			'blur .edit':		'close',
			// The "rendered" event is triggered by Thorax each time render()
			// is called and the result of the template has been appended
			// to the View's $el
			rendered: function () {
				this.$el.toggleClass('completed', this.model.get('completed'));
			}
		},

		// Toggle the `"completed"` state of the model.
		toggleCompleted: function () {
			this.model.toggle();
		},

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function () {
			this.$el.addClass('editing');
			this.$('.edit').focus();
		},

		// Close the `"editing"` mode, saving changes to the todo.
		close: function () {
			var value = this.$('.edit').val().trim();

			if (value) {
				this.model.save({ title: value });
			} else {
				this.clear();
			}

			this.$el.removeClass('editing');
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function (e) {
			if (e.which === ENTER_KEY) {
				this.close();
			}
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function () {
			this.model.destroy();
		}
	});
}());

/*global Thorax, _*/
(function () {
	'use strict';

	Thorax.View.extend({
		name: 'stats',

		events: {
			'click #clear-completed': 'clearCompleted',
			// The "rendered" event is triggered by Thorax each time render()
			// is called and the result of the template has been appended
			// to the View's $el
			rendered: 'highlightFilter'
		},

		initialize: function () {
			// Whenever the Todos collection changes re-render the stats
			// render() needs to be called with no arguments, otherwise calling
			// it with arguments will insert the arguments as content
			this.listenTo(window.app.Todos, 'all', _.debounce(function () {
				this.render();
			}));
		},

		// Clear all completed todo items, destroying their models.
		clearCompleted: function () {
			_.each(window.app.Todos.completed(), function (todo) {
				todo.destroy();
			});

			return false;
		},

		// Each time the stats view is rendered this function will
		// be called to generate the context / scope that the template
		// will be called with. "context" defaults to "return this"
		context: function () {
			var remaining = window.app.Todos.remaining().length;
			return {
				itemText: remaining === 1 ? 'item' : 'items',
				completed: window.app.Todos.completed().length,
				remaining: remaining
			};
		},

		// Highlight which filter will appear to be active
		highlightFilter: function () {
			this.$('#filters li a')
			.removeClass('selected')
			.filter('[href="#/' + (window.app.TodoFilter || '') + '"]')
			.addClass('selected');
		}
	});
}());
/*global Thorax, ENTER_KEY*/
(function () {
	'use strict';

	// The Application
	// ---------------

	// This view is the top-level piece of UI.
	Thorax.View.extend({
		// Setting a name will assign the template Thorax.templates['app']
		// to the view and create a view class at Thorax.Views['app']
		name: 'app',

		// Delegated events for creating new items, and clearing completed ones.
		events: {
			'keypress #new-todo': 'createOnEnter',
			'click #toggle-all': 'toggleAllComplete',
			// Any events specified in the collection hash will be bound to the
			// collection with `listenTo`. The collection was set in js/app.js
			collection: {
				'change:completed': 'toggleToggleAllButton',
				filter: 'toggleToggleAllButton'
			},
			rendered: 'toggleToggleAllButton'
		},

		toggleToggleAllButton: function () {
			var toggleInput = this.$('#toggle-all')[0];
			if (toggleInput) {
				toggleInput.checked = !this.collection.remaining().length;
			}
		},

		// When this function is specified, items will only be shown
		// when this function returns true
		itemFilter: function (model) {
			return model.isVisible();
		},

		// Generate the attributes for a new Todo item.
		newAttributes: function () {
			return {
				title: this.$('#new-todo').val().trim(),
				order: this.collection.nextOrder(),
				completed: false
			};
		},

		// If you hit return in the main input field, create new **Todo** model,
		// persisting it to *localStorage*.
		createOnEnter: function (e) {
			if (e.which !== ENTER_KEY || !this.$('#new-todo').val().trim()) {
				return;
			}

			this.collection.create(this.newAttributes());
			this.$('#new-todo').val('');
		},

		toggleAllComplete: function () {
			var completed = this.$('#toggle-all')[0].checked;
			this.collection.each(function (todo) {
				todo.save({
					completed: completed
				});
			});
		}
	});
}());

/*global Backbone*/
(function () {
	'use strict';

	// Todo Router
	// ----------

	var Router = Backbone.Router.extend({
		routes: {
			'': 'setFilter',
			':filter': 'setFilter'
		},

		setFilter: function (param) {
			// Set the current filter to be used
			window.app.TodoFilter = param ? param.trim().replace(/^\//, '') : '';
			// Thorax listens for a `filter` event which will
			// force the collection to re-filter
			window.app.Todos.trigger('filter');
		}
	});

	window.app.TodoRouter = new Router();

}());
