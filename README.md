# Marrow.js

`Marrow.js` это микрофреймворк с загрузчиком, который позволяет создавать в страницу "песочницу" и загружать в нее любое веб приложение предоставляя ему api для работы как с основной страницей + набор полезных утилит.

---

`Marrow.js` предоставляет следующие механизмы:

1. Загрузка веб-приложения в песочницу с настройкой кастомного окружения и подгрузкой зависимостей через рецепты;
1. Для каждого приложения можно подключить один рецепт который определяет список зависимостей для запуска приложения. Так же отвечает за подготовку окружения песочницы


## Загрузчик
###### Расположение: `core/core.loader.js`

Загрузчик `Marrow` является оберткой над загрузчиком [curl.js](https://github.com/cujojs/curl/) собранного с плугинами `js`, `css`, `link`. 

В свою очередь предотвращая проникновение переменных `curl.js` в глобальную область видимости, а так же предоставляя следующие возможности:

1. Настройка загрузчика в зависимости от настроек приложения;
1. Определение и автоматическая подстановка необходимых префиксов в зависимости от расширения файла;
1. Возможность контролировать область загрузки файлов:
	* Загрузка в "песочницу" к текущему приложению. Поведение по умолчанию;
	* Загрузка в основную страницу. Используется для загрузки стилей в область видимости страницы;
1. В зависимости от параметра запуска приложения позволяет загружать девелоперские версии файлов или же пожатые и минифицированные (файлы для продакшена).

Все статические ресурсы должны хранится в папке `/static` путь до которой можно указывать в настройках приложения (*см. соответсвующий раздел*).

Загрузчик предоставляет следующие преднастроенные правила для загрузки файлов:

* `root` – Правило указывает на директорию `js`. Cоздано "на всякий случай" и вредли пригодится в реальных условиях;

	```
"root/marrow.js" => site.com/static/js/marrow.js
```

* [**deprecated**] `core` – Правило указывает на директорию `js/core`. Создавалось для загрузки файлов ядра. Начиная с версии `0.2.15` ядро без сборки не работоспособно.

	```
"core/core.observatory.js" => site.com/static/js/core/core.observatory.js
```

* `system` – Правило указывает на директорию `js/libs`. Cоздано

	```
"system/jquery/jquery.caret.min.js" => site.com/static/js/libs/jquery/jquery.caret.min.js
```

* `recipes` – Правило указывает на директорию `js/recipes`. Cоздано
* `helpers` – Правило указывает на директорию `js/helpers`. Cоздано
* `recipe` – Правило указывает на директорию `js/recipes/<имя выбранного рецепта>`. Cоздано
* `recipe_libs` – Правило указывает на директорию `js/recipes/<имя выбранного рецепта>/libs`. Cоздано

## Рецепты
###### Расположение: `recipes/<recipe_name>/recipe.js`

Для каждого приложения можно подключить один рецепт который определяет список зависимостей для запуска приложения. Так же отвечает за подготовку окружения песочницы перед инициализацией приложения.

Рецепт может 

## Транзиты
###### Расположение: `core/transits/core.transit.<transit_name>.js`

Транзиты предназначены для прозрачного прокидывания определенного функционала (нативного фунционала или же функционала библиотек) из песочницы в главную страницу.

Существующие транзиты:

1. `core.transit.jquery` – Предназначен для прокидывания селекторов jQuery загруженного в песочницу. Всем селекторам выполненные в песочнице будет автоматически добавляться контекс поиска основной страницы
	> ##### Пример:
	> Без активированного транзита селектор `$('body')` выдаст в качестве результата DOM элемент `sandbox.document.body` находящийся в песочнице, который не предсталвяет никакой ценности, так как песочница не имеет визуального представления.
	
	> С активированным транзитом результатом этого же селектора будет равен `window.document.body`, которой является уже элементом оснавной страницы с которой уже можно работать.

1. `core.transit.location` – Предназначен для двунаправленной синхронизации `location.hash`. При активации этого транзита изменение `location.hash` в песочнице моментально будет отражено на `location.hash` основной страницы и наоборот.

### Работа с транзитами

Для активации транзитов стоит использовать метод: 

```
core.useTransits('<transit_name>', '<transit_name>', …, options);
```

Который принимает в качестве аргументов перечисление строковых названий транзитов которые необходимо активировать. Опции для метода активации транзитов должны идти объектом переданный последним аргументом. 
> Объект опций обязателен для передачи.

#####Пример:

```
// Активируем транзит для jQuery
core.useTransits('jquery', options);

// Активируем транзиты jquery и location
core.useTransits('jquery', 'location', options);
```

Для отключения транзитов используем метод `core.removeTransits()` который принимает в качестве аргументов все тоже самое что и метод `useTransits()`

### Создание новых транзитов

*To be continued…*


## Параметры приложения

*To be continued…*


## TODO

1. Дописать ReadMe;
2. Написать примеры работы;
3. Вынести демки в бранч `gh-pages`;
4. Сделать документацию по коду;


## Авторы
[Anton Ignatov](https://github.com/a-ignatov-parc)

Так же особое спасибо за помощь:

* [Филипп Андрейчев](https://github.com/f-andrejchev-parc)

[И всем остальным кто помогал](https://github.com/a-ignatov-parc/Marrow/contributors)