var fs = require('fs'),
	pkg = require('./package.json'),
	rootPath = pkg.rootPath + '/',
	corePath = rootPath + 'core/',
	appsPath = rootPath + 'apps/',
	recipesPath = rootPath + 'recipes/',
	coreNameList = fs.readdirSync(corePath),
	coreUtilsList = fs.readdirSync(corePath + 'utils'),
	coreTransitsList = fs.readdirSync(corePath + 'transits'),
	appsNameList = fs.readdirSync(appsPath),
	recipesList = fs.readdirSync(recipesPath),
	processName = function(pathname) {
		var filename = pathname
				.split('/')
				.pop()
				.split('.')
				.shift(),
			wordList = filename.split(/[-_]/g);

		for (var i = 1, length = wordList.length; i < length; i++) {
			wordList[i] = wordList[i].substr(0, 1).toUpperCase() + wordList[i].substr(1);
		}
		console.log(pathname, wordList);
		return wordList.join('');
	},
	coreFiles = [corePath + 'core.js'],
	bannerTemplate = '/**\n' +
		' * <%= pkg.name %> - v<%= pkg.version %> (build date: <%= grunt.template.today("dd/mm/yyyy") %>)\n' +
		' * <%= pkg.url %>\n' +
		' * <%= pkg.description %>\n' +
		' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
		' */\n';

var gruntConfig = {
		pkg: pkg,
		version: {
			defaults: {
				src: rootPath + 'marrow.js'
			}
		},
		bumpup: {
			file: 'package.json'
		},
		docco: {
			core: {
				src: corePath + '**/*.js',
				options: {
					output: 'docs/core'
				}
			},
			helpers: {
				src: rootPath + 'helpers/**/*.js',
				options: {
					output: 'docs/helpers'
				}
			}
		},
		concat: {
			loader: {
				src: corePath + 'core.loader.js',
				dest: rootPath + 'loader.js'
			}
		},
		watch: {
			styles: {
				files: pkg.sassPath + '/**/*.scss',
				tasks: ['compass:watch']
			},
			templates: {
				files: appsPath + '**/*.hbs',
				tasks: ['handlebars:compile']
			}
		},
		uglify: {
			loader: {
				src: rootPath + 'loader.js',
				dest: rootPath + 'loader.min.js',
				options: {
					banner: bannerTemplate
				}
			}
		},
		qunit: {
			files: [rootPath + 'tests/**/*.html']
		},
		compass: {
			watch: {
				options: {
					cssDir: pkg.cssPath,
					sassDir: pkg.sassPath,
					imagesDir: pkg.imgPath,
					fontsDir: pkg.fontsPath,
					outputStyle: 'expanded',
					relativeAssets: true,
					debugInfo: true
				}
			},
			dev: {
				options: {
					cssDir: pkg.cssPath,
					sassDir: pkg.sassPath,
					imagesDir: pkg.imgPath,
					fontsDir: pkg.fontsPath,
					outputStyle: 'expanded',
					relativeAssets: true,
					debugInfo: true,
					force: true
				}
			},
			prod: {
				options: {
					cssDir: pkg.cssPath + '/build',
					sassDir: pkg.sassPath,
					imagesDir: pkg.imgPath,
					fontsDir: pkg.fontsPath,
					outputStyle: 'compressed',
					environment: 'production',
					noLineComments: true,
					relativeAssets: true,
					force: true
				}
			}
		},
		handlebars: {
			compile: {
				options: {
					node: true,
					wrapped: true,
					namespace: 'App.Templates',
					processName: processName
				},
				files: {}
			}
		},
		jshint: {
			options: {
				indent: 4,
				expr: true,
				boss: true,
				undef: true,
				curly: true,
				forin: true,
				unused: true,
				newcap: true,
				eqnull: true,
				jquery: true,
				white: false,
				browser: true,
				noempty: true,
				latedef: true,
				camelcase: true,
				quotmark: 'single',
				globals: {
					NO: true,
					YES: true,
					App: true,
					module: true,
					require: true,
					console: true
				}
			},
			beforeconcat: ['grunt.js'],
			afterconcat: [rootPath + 'marrow.js']
		}
	},
	defaultTasks = ['watch'],
	releaseTasks = ['jshint:beforeconcat'],
	concatTasks = ['concat:loader'],
	minTasks = ['compass:dev', 'compass:prod', 'uglify:loader'],
	marrowExcludeList = {
		'core.js': true,
		'core.loader.js': true
	},
	coreFilesBuilder = function(target, list, directoryName) {
		list.forEach(function(file) {
			var path = corePath + (directoryName ? directoryName : '') + file;

			if (file.indexOf('._') !== 0 && !marrowExcludeList[file] && !fs.statSync(path).isDirectory()) {
				target.push(path);
			}
		});
	};

// Собираем ядро.  
// Собираем информацию о доступных транзитах.
coreFilesBuilder(coreFiles, coreTransitsList, 'transits/');

// Собираем информацию о доступных утилитах.
coreFilesBuilder(coreFiles, coreUtilsList, 'utils/');

// Собираем информацию об остальных модулях.
coreFilesBuilder(coreFiles, coreNameList);

// Добавляем задачу на генерацию документации по доступным рецептам
recipesList.forEach(function(recipe) {
	if (fs.statSync(recipesPath + recipe).isDirectory()) {
		gruntConfig.docco['recipe_' + recipe] = {
			src: recipesPath + recipe + '/*.js',
			options: {
				output: 'docs/recipes/' + recipe
			}
		};
	}
});

// Добавляем задачу на конкатенацию ядра
gruntConfig.concat.core = {
	src: ['<banner>'].concat(coreFiles),
	dest: rootPath + 'marrow.js'
};
concatTasks.push('concat:core');

// Добавляем задачу на минификацию ядра
gruntConfig.uglify.core = {
	src: ['<banner>', rootPath + 'marrow.js'],
	dest: rootPath + 'marrow.min.js',
	options: {
		banner: bannerTemplate
	}
};
minTasks.push('uglify:core');

// Добавляем задачу на линтование ядра
gruntConfig.jshint.beforeconcat = gruntConfig.jshint.beforeconcat.concat(coreFiles);

// Собираем информацию о приложениях
appsNameList.forEach(function(appName) {
	var path = appsPath + appName + '/',
		appFileList = [path + 'routes/workspace.js', path + 'views/workspace.js'],
		helpersFileList = [],
		sandboxFileList = [],
		handler = function(target, path, name) {
			if (name.indexOf('._') !== 0) {
				target.push(path + name);
			}
		},
		configPath = path + 'files.js',
		configString,
		config;

	// Проверяем есть ли файл `files.js` и если он существует, то парсим его для того чтоб собрать 
	// файлы приложения.
	if (fs.existsSync(configPath)) {
		configString = fs.readFileSync(configPath, 'utf-8');
		config = JSON.parse(configString.substr(configString.indexOf('{')));
	}

	// Добавляем задачу на генерацию документации по приложению
	gruntConfig.docco[appName] = {
		src: path + '*.js',
		options: {
			output: 'docs/apps/' + appName
		}
	};

	// Добавляем задачу на генерацию документации по внутренней структуре приложения
	if (fs.existsSync(path + 'collections')) {
		gruntConfig.docco[appName + '_collections'] = {
			src: path + 'collections/*.js',
			options: {
				output: 'docs/apps/' + appName + '/collections'
			}
		};
	}

	if (fs.existsSync(path + 'models')) {
		gruntConfig.docco[appName + '_models'] = {
			src: path + 'models/*.js',
			options: {
				output: 'docs/apps/' + appName + '/models'
			}
		};
	}

	if (fs.existsSync(path + 'routes')) {
		gruntConfig.docco[appName + '_routes'] = {
			src: path + 'routes/*.js',
			options: {
				output: 'docs/apps/' + appName + '/routes'
			}
		};
	}

	if (fs.existsSync(path + 'tests')) {
		gruntConfig.docco[appName + '_tests'] = {
			src: path + 'tests/*.js',
			options: {
				output: 'docs/apps/' + appName + '/tests'
			}
		};
	}

	if (fs.existsSync(path + 'views')) {
		gruntConfig.docco[appName + '_views'] = {
			src: path + 'views/*.js',
			options: {
				output: 'docs/apps/' + appName + '/views'
			}
		};
	}

	// Собираем документацию из папки `files` для тех приложений у которых нет нормального 
	// структурного разделения и все лежит в одной папке
	if (fs.existsSync(path + 'files')) {
		gruntConfig.docco[appName + '_files'] = {
			src: path + 'files/*.js',
			options: {
				output: 'docs/apps/' + appName + '/files'
			}
		};
	}

	// Добавляем задачу на минификацию главного файла приложения
	gruntConfig.uglify[appName + '_main'] = {
		src: path + appName + '.js',
		dest: path + 'build/' + appName + '.min.js'
	};
	minTasks.push('uglify:' + appName + '_main');

	// Если в файловом конфиге есть раздел `app`, то собираем по нему все указанные файлы, которые 
	// войдут в приложение.
	if (config) {
		if (config.app) {
			config.app.forEach(function(item) {
				if (item.load) {
					item.load.forEach(function(file) {
						handler(appFileList, path, file);
					});
				} else {
					handler(appFileList, path, item);
				}
			});

			// Добавляем задачу на конкатенацию файлов приложения
			gruntConfig.concat[appName] = {
				src: appFileList,
				dest: path + 'build/base.js',
				options: {
					banner: '/* jshint -W015 */\n' +
							'/* jshint -W014 */\n' +
							'/* jshint -W069 */\n' +
							'/* jshint -W098 */\n' +
							'/* jshint -W109 */\n' +
							'/* jshint -W117 */\n'
				}
			};
			concatTasks.push('concat:' + appName);

			// Добавляем задачу на минификацию файлов приложения
			gruntConfig.uglify[appName] = {
				src: path + 'build/base.js',
				dest: path + 'build/base.min.js'
			};
			minTasks.push('uglify:' + appName);
		}

		// Если в файловом конфиге есть раздел helpers`, то собираем по нему все указанные файлы, которые 
		// войдут в набор библиотек необходимый для работы приложения.
		if (config.helpers) {
			config.helpers.forEach(function(item) {
				if (item.load) {
					item.load.forEach(function(file) {
						handler(helpersFileList, rootPath, file);
					});
				} else {
					handler(helpersFileList, rootPath, item);
				}
			});
		}

		// Если в файловом конфиге есть раздел sandbox`, то собираем по нему все указанные файлы, которые 
		// войдут в набор библиотек необходимый для работы приложения.
		if (config.sandbox) {
			config.sandbox.forEach(function(item) {
				if (item.load) {
					item.load.forEach(function(file) {
						handler(sandboxFileList, path, file);
					});
				} else {
					handler(sandboxFileList, path, item);
				}
			});

			// Добавляем задачу на конкатенацию библиотек приложения
			gruntConfig.concat[appName + '_libs'] = {
				src: sandboxFileList.concat(helpersFileList),
				dest: path + 'build/libs.js'
			};
			concatTasks.push('concat:' + appName + '_libs');

			// Добавляем задачу на минификацию библиотек приложения
			gruntConfig.uglify[appName + '_libs'] = {
				src: path + 'build/libs.js',
				dest: path + 'build/libs.min.js'
			};
			minTasks.push('uglify:' + appName + '_libs');
		}
	}

	// Проверяем есть ли папка `templates`
	if (fs.existsSync(path + 'templates')) {
		// Добавляем пути на компиляцию шаблонов у приложений
		gruntConfig.handlebars.compile.files[path + 'templates/build/templates.js'] = path + 'templates/**/*.hbs';
	}

	// Добавляем задачу на линтование файлов приложения
	gruntConfig.jshint.beforeconcat = gruntConfig.jshint.beforeconcat.concat(helpersFileList, appFileList, '!' + path + 'templates/build/templates.js');
	gruntConfig.jshint.afterconcat.push(path + 'build/base.js');
});

module.exports = function(grunt) {
	// Инициализируем конфиг
	grunt.initConfig(gruntConfig);

	// Подключаем таски
	grunt.loadNpmTasks('grunt-docco');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-handlebars');

	// Регистрируем кастомные таски
	grunt.registerTask('updatepkg', 'Update pkg version after bumpup.', function() {
		gruntConfig.version.options || (gruntConfig.version.options = {});
		gruntConfig.pkg = gruntConfig.version.options.pkg = grunt.file.readJSON('package.json');
		grunt.log.writeln('ok!');
	});

	grunt.registerTask('debuginfo', 'Show debug info about harvested options objects.', function() {
		console.log('Projects list: \n"' + appsNameList.join(', ') + '"\n');
		console.log('Concat tasks list: \n"' + concatTasks.join(', ') + '"\n');
		console.log('Uglify tasks list: \n"' + minTasks.join(', ') + '"\n');

		console.log('Concat tasks:');
		console.log(gruntConfig.concat);

		console.log('\nBefore concat jshint list:');
		console.log(gruntConfig.jshint.beforeconcat);
		console.log('\nAfter concat jshint list:');
		console.log(gruntConfig.jshint.afterconcat);
		console.log('\nTemplates compile list');
		console.log(gruntConfig.handlebars.compile.files);
		console.log('\n');
	});

	// Регистрируем таски
	grunt.registerTask('tests', 'qunit');
	grunt.registerTask('default', defaultTasks);
	grunt.registerTask('templates', 'handlebars:compile');
	grunt.registerTask('loader', ['bumpup:build', 'concat:loader', 'uglify:loader']);
	grunt.registerTask('core', ['bumpup:build', 'updatepkg', 'concat:core', 'version', 'uglify:core']);

	// Компилируем проект без каких либо проверок на привильность кода
	grunt.registerTask('compile', ['bumpup:build', 'updatepkg', 'debuginfo'].concat('handlebars:compile', concatTasks, 'version', minTasks));

	// Полностью готовим проект к релизу со всеми проверками и генерацией документации
	grunt.registerTask('release', releaseTasks.concat('bumpup:build', 'updatepkg', 'debuginfo', 'handlebars:compile', concatTasks, 'version', 'jshint:afterconcat', 'qunit', minTasks, 'docco'));
};