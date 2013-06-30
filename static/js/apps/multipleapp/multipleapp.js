window.AppConstructor = function(options) {
	_.extend(this, {
		afterInit: function() {
			this.container.prepend('<div style="background: ' + (this.bootstrapData.Color || '#ccc') + '; padding: 10px;">' + this.bootstrapData.Text + '</div>');
		}
	}, options);
};