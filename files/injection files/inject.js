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
loadScript('http://localhost/marrow/files/static/js/app.loader.js', function() {
	loadScript('http://localhost/marrow/files/static/js/apps/testapp/location_dev.js', function() {
		loadScript('http://localhost/marrow/files/static/js/apps/testapp/files.js', function() {
			new WebApp.Loader('TestApp');
		});
	});
});