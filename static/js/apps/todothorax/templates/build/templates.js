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