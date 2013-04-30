// Список файлов необходимый для работы веб-приложения.  
// Все ключи и значения должны быть обязательно обрамлены в двойные ковычки `"` иначе _node.js_ не 
// сможет его распарсить.
// 
// `common` - Список файлов, которые должны загрузится в глобальный документ.
// 
// `sandbox` - Список файлов, которые не относятся на прямую к приложению и должны быть загруженны в 
// песочницу.
// 
// `helpers` - Список хелперов, которые необходимы для работы приложения.  
// Хелперы должны находится в папке `js/helpers`, а путь до них должен указываться с 
// префиксом `helpers/`
// 
// `app` - Список файлов на прямую относящийся к приложению. При сборке и минификации эти файлы 
// объединяются и этот блок на продакшн не загружается.
WebApp.TestApp.resources = {
	"styles": [
		"styles/main.css"
	],

	"common": [
		"system/jquery/jquery.caret.min.js"
	],

	"sandbox": [
		"libs/jquery/jquery.mockjson.js",
		"libs/jquery/jquery.carousel.sandbox.js",
		"libs/hcf-layout.js",
		"tests/mock.js"
	],

	"helpers": [
		"helpers/testapp.js"
	],

	"app": [
		"templates/build/templates.js",
		"routes/workspace.js",
		"views/workspace.js",
		"views/gallery.js"
	]
}