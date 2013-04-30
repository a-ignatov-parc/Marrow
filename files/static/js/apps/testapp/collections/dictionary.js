App.Collections.Dictionary = App.Backbone.Collection.extend({
	url: function() {
		return this.core.hosts.request + 'Dictionary/Get/';
	},
	model: App.Models.DictionaryItem,

	initialize: function() {
		this.name = null;
		this.callback = null;
	},

	processRequestData: function() {
		return {
			Name: this.name,
			LoadAll: YES
		};
	},

	parse: function(response, xhr) {
		if (response.Success) {
			return response.Result.Items;
		}
	}
});

