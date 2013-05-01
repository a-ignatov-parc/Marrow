// Все урлы должны заканчиваться "/", кроме тех что указываются в customPath
// 
// Доступные параметры:
// app (не обязательный параметр) - адрес куда приложение будет посылать все запросы, если сервисы находятся не рутовом урле;
// Пример: 
//     locations: {
//         app: 'http://localhost/testapp/'
//     }
// 
// static (не обязательный параметр) - адрес откуда должны грузится все файлы, если он отличается от того что указан в app;
// Пример: 
//     locations: {
//         app: 'http://localhost/testapp/',
//         static: 'http://localhost/testapp/Content/'
//     }
// 
// customPath (не обязательный параметр) - pathname на которых приложение может запускаться относительно корня указанного в app.
// Пример: 
//     locations: {
//         app: 'http://localhost/testapp/',
//         customPath: '/testapp/'
//     }
// 
// services (не обязательный параметр) - объект с коллекцией адресов на специальные сервисы которые не укладываются в стандартную модель адресов
// Пример: 
//     locations: {
//         app: 'http://localhost/testapp/',
//         customPath: '/testapp/',
//         services: {
//             auth: 'http://localhost/account/'
//         }
//     }
WebApp.TestApp = {
	debugMode: true,
	strictMode: false,
	locations: {
		'app': 'http://localhost/marrow/',
		'static': 'http://localhost/marrow/',
		'customPath': '/marrow/'
	}
};