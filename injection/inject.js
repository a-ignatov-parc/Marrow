function loadScript(sScriptSrc, oCallback) {
	var oHead = document.getElementsByTagName('head')[0];
	var oScript = document.createElement('script');
 
	oScript.type = 'text/javascript';
	oScript.src = sScriptSrc;
 
	// most browsers
	oScript.onload = oCallback;
 
	// IE 6 & 7
	oScript.onreadystatechange = function () {
		if (this.readyState == 'complete') {
			oCallback();
		}
	}
	oHead.appendChild(oScript);
}
loadScript('http://localhost/marrow/static/js/loader.js', function() {
	var colors = ['#256799', '#faca00', '#f42200'];

	new WebApp.Loader('MultipleApp', {
		loadOptions: {
			resources: {
				'styles': 'styles/demo.css'
			},
			locations: {
				'static': 'http://localhost/marrow/'
			}
		},
		bootstrapData: {
			Color: colors[Math.floor(Math.random() * (colors.length - 1))],
			Text: 'App1'
		}
	});
});