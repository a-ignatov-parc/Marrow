App.Views.Gallery = App.Backbone.View.extend({
	className: 'carousel example-1',
	template: 'galleryList',

	initialize: function() {
		this.render();
	},

	render: function() {
		this.$el
			.html(this.template())
			.appendTo(this.__aliases.layouts.contents)
			.carousel();
	}
});