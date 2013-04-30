(function($) {

var _mocked = [];
$.mockJSON = function(request, template) {
    for (var i = 0; i < _mocked.length; i++) {
        var mock = _mocked[i];
        if (mock.request.toString() == request.toString()) {
            _mocked.splice(i, 1);
            break;
        }
    }

    _mocked.push({
        request:request,
        template:template
    });
    
    return $;
};

$.mockJSON.random = true;


var _original_ajax = $.ajax;
$.ajax = function(options) {
    if (options.dataType === 'json') {
        for (var i = 0; i < _mocked.length; i++) {
            var mock = _mocked[i];
            if (mock.request.test(options.url)) {
                options.success($.mockJSON.generateFromTemplate(mock.template));
                return $;
            }
        }
    }
    
    return _original_ajax.apply(this, arguments);
}


$.mockJSON.generateFromTemplate = function(template, name) {
    var length = 0;
    var matches = (name || '').match(/\w+\|(\d+)-(\d+)/);
    if (matches) {
        var length_min = parseInt(matches[1], 10);
        var length_max = parseInt(matches[2], 10);
        length = Math.round(rand() * (length_max - length_min)) + length_min;
    }
        
    var generated = null;
    switch (type(template)) {
        case 'array':
            generated = [];
            for (var i = 0; i < length; i++) {
                generated[i] = $.mockJSON.generateFromTemplate(template[0]);
            }
            break;

        case 'object':
            generated = {};
            for (var p in template) {
                generated[p.replace(/\|(\d+-\d+|\+\d+)/, '')] = $.mockJSON.generateFromTemplate(template[p], p);
                var inc_matches = p.match(/\w+\|\+(\d+)/);
                if (inc_matches && type(template[p]) == 'number') {
                    var increment = parseInt(inc_matches[1], 10);
                    template[p] += increment;
                }
            }
            break;

        case 'number':
            generated = (matches)
                ? length
                : template;
            break;

        case 'boolean':
            generated = (matches)
                ? rand() >= 0.5
                : template;
            break;

        case 'string':
            if (template.length) {
                generated = '';
                length = length || 1;
                for (var i = 0; i < length; i++) {
                    generated += template;
                }
                var keys = generated.match(/@([A-Z_0-9\(\),]+)/g) || [];
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    generated = generated.replace(key, getRandomData(key));
                }
            } else {
                generated = ""
                for (var i = 0; i < length; i++) {
                    generated += String.fromCharCode(Math.floor(rand() * 255));
                }
            }
            break

        default:
            generated = template;
            break;
    }
    return generated;

}


function getRandomData(key) {
    key = key.substr(1); // remove "@"
    
    //var params = key.match(/\(((\d+),?)+\)/g) || [];
    var params = key.match(/\(([^\)]+)\)/g) || [];
    
    if (!(key in $.mockJSON.data)) {
        console.log(key);
        console.log(params);
        return key;
    }
    
    var a = $.mockJSON.data[key];
    
    switch (type(a)) {
        case 'array':
            var index = Math.floor(a.length * rand());
            return a[index];
            
        case 'function':
            return a();
    }
}


function type(obj) {
    return $.isArray(obj)
        ? 'array' 
        : (obj === null)
            ? 'null'
            : typeof obj;
}


function pad(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num + '';
}

var _random_numbers = [0.021768910889510606,0.23762323165420307,0.9079616118204306,0.6534305309997466,0.22049697572443694,0.07687466163364898,0.8017428775547905,0.16165353264404825,0.5124345671670483,0.19337327636624613,0.39963994200698416,0.8012592654139514,0.22474962687229938,0.9791396234452399,0.7965428353317756,0.9777664340629622,0.5135216702983731,0.7407128236192145,0.12880984991420075,0.8186600800491484,0.5187691445438851,0.034723021925916586,0.5625092833040853,0.02502838571997701,0.663696305503698,0.3481608684353138,0.8991623585175106,0.3640542564277087,0.8320766874121723,0.012778915627689846,0.1427680370061336,0.9774408289203956,0.010229381207667587,0.2596610885223093,0.6150540104297127,0.7130773919030915,0.8638338302974085,0.6178483032907357,0.980312844391733,0.5007277415012348,0.6348672031113127,0.4400097775503303,0.8468458451408212,0.38724997893647317,0.690237920987028,0.19850102297146477,0.44895115941315766,0.22283381913760725,0.031228117310125314,0.3367510872581615,0.28155752394210787,0.14696694832580504,0.08164635161760991,0.8837733477785624,0.4590179148539142,0.9613195413217465,0.11263127577456922,0.743695635896287,0.0002424891439143373,0.1964622832546613,0.7333363138878922,0.5575568682003356,0.20426374168098604,0.18030934250338893,0.9792636408392759,0.30121911048336913,0.7734906886720265,0.6984051127767527,0.6638058511379343,0.3310956256388182,0.36632372827973203,0.8996494702333895,0.8235917663049763,0.418496734118911,0.8164648495097332,0.9457831606354686,0.2845227542117049,0.42374718399151545,0.3431728911657228,0.5289314006219973,0.6029243600407113,0.6528301140700757,0.6948768236197832,0.7887302784092911,0.8950274196119906,0.6121642239166305,0.31797481561514696,0.34903732589844216,0.3580320092281766,0.8312225728434115,0.32331010157206974,0.16395388672837796,0.6072960306003872,0.6580526967999424,0.23472961545632742,0.6138637855489343,0.3067303339060682,0.44935935129958315,0.24729465243280668,0.8244189715967711];
function rand() {
    if ($.mockJSON.random) {
        return Math.random();
    } else {
        _random_numbers = _random_numbers.concat(_random_numbers.splice(0,1));
        return _random_numbers[0];
    }
}


function randomDate() {
    return new Date(Math.floor(rand() * new Date().valueOf()));
}


$.mockJSON.data = {
    NUMBER : "0123456789".split(''),
    LETTER_UPPER : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(''),
    LETTER_LOWER : "abcdefghijklmnopqrstuvwxyz".split(''),
    MALE_FIRST_NAME : ["James", "John", "Robert", "Michael", "William", "David",
        "Richard", "Charles", "Joseph", "Thomas", "Christopher", "Daniel", 
        "Paul", "Mark", "Donald", "George", "Kenneth", "Steven", "Edward",
        "Brian", "Ronald", "Anthony", "Kevin", "Jason", "Matthew", "Gary",
        "Timothy", "Jose", "Larry", "Jeffrey", "Frank", "Scott", "Eric"],
    FEMALE_FIRST_NAME : ["Mary", "Patricia", "Linda", "Barbara", "Elizabeth", 
        "Jennifer", "Maria", "Susan", "Margaret", "Dorothy", "Lisa", "Nancy", 
        "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon",
        "Michelle", "Laura", "Sarah", "Kimberly", "Deborah", "Jessica", 
        "Shirley", "Cynthia", "Angela", "Melissa", "Brenda", "Amy", "Anna"], 
    LAST_NAME : ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
        "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson",
        "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson",
        "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark",
        "Lewis", "Robinson", "Walker", "Perez", "Hall", "Young", "Allen"],
    EMAIL : function() {
        return getRandomData('@LETTER_LOWER')
            + '.'
            + getRandomData('@LAST_NAME').toLowerCase()
            + '@'
            + getRandomData('@LAST_NAME').toLowerCase()
            + '.com';
    },
    DATE_YYYY : function() {
        var yyyy = randomDate().getFullYear();
        return yyyy + '';
    },
    DATE_DD : function() {
        return pad(randomDate().getDate());
    },
    DATE_MM : function() {
        return pad(randomDate().getMonth() + 1);
    },
    TIME_HH : function() {
        return pad(randomDate().getHours());
    },
    TIME_MM : function() {
        return pad(randomDate().getMinutes());
    },
    TIME_SS : function() {
        return pad(randomDate().getSeconds());
    },
    LOREM : function() {
        var words = 'lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
        var index = Math.floor(rand() * words.length);
        return words[index];
    },
    LOREM_IPSUM : function() {
        var words = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
        var result = [];
        var length = Math.floor(rand() * words.length / 2);
        for (var i = 0; i < length; i++) {
            var index = Math.floor(rand() * words.length);
            result.push(words[index]);
        }
        return result.join(' ');
    }
};


})(jQuery);

/* jQuery Carousel 0.9.8
Copyright 2010 Thomas Lanciaux and Pierre Bertet.
This software is licensed under the CC-GNU LGPL <http://creativecommons.org/licenses/LGPL/2.1/>
*/
;(function($, window, document){
	
	$.fn.carousel = function(params){
		
		var params = $.extend({
			direction: "horizontal",
			loop: false,
			dispItems: 1,
			pagination: false,
			paginationPosition: "inside",
			nextBtn: '<input type="button" value="Next" />',
			prevBtn: '<input type="button" value="Previous" />',
			btnsPosition: "inside",
			nextBtnInsert: "insertAfter",
			prevBtnInsert: "insertBefore",
			nextBtnInsertFn: false,
			prevBtnInsertFn: false,
			autoSlide: false,
			autoSlideInterval: 3000,
			delayAutoSlide: false,
			combinedClasses: false,
			effect: "slide",
			slideEasing: "swing",
			animSpeed: 300,
			equalWidths: "true",
			verticalMargin: 0,
			callback: function () {}, 
			useAddress: false,
			adressIdentifier: "carousel",
			tabLabel: function (tabNum) { return tabNum; },
			showEmptyItems: true,
			ajaxMode:false,
			ajaxUrl:"",
			stopSlideBtn: false,
			stopSlideTextPause: "Pause",
			stopSlideTextPlay: "Play"
		}, params);
		
		// Buttons position
		if (params.btnsPosition == "outside"){
			params.prevBtnInsert = "insertBefore";
			params.nextBtnInsert = "insertAfter";
		}
		
		// Slide delay
		params.delayAutoSlide = 0 + params.delayAutoSlide;
		
		return this.each(function(){
			
			// Env object
			var env = {
				$elts: {},
				params: params,
				launchOnLoad: []
			};
					
			// Carousel main container
			env.$elts.carousel = $(this).addClass("js");
			
			// Carousel content
			env.$elts.content = $(this).children().css({position: "absolute", "top": 0});
			
			// Content wrapper
			env.$elts.wrap = env.$elts.content.wrap('<div class="carousel-wrap"></div>').parent().css({overflow: "hidden", position: "relative"});
			
			// env.steps object
			env.steps = {
				first: 0, // First step
				count: env.$elts.content.children().length // Items count
			};
			
			// Loader 
			env.$elts.loader = $('<div class="loader"></div>').css({'position':'absolute'});
			
			// Last visible step
			env.steps.last = env.steps.count - 1;
			
			// Pagination
			if (env.params.pagination) {
				initPagination(env);
			}
			
			// Prev Button
			if ($.isFunction(env.params.prevBtnInsertFn)) {
				env.$elts.prevBtn = env.params.prevBtnInsertFn(env.$elts);
			} else { 
				if (params.btnsPosition == "outside"){
					env.$elts.prevBtn = $(params.prevBtn)[params.prevBtnInsert](env.$elts.carousel);
				} else {
					env.$elts.prevBtn = $(params.prevBtn)[params.prevBtnInsert](env.$elts.wrap);
				}
			}
			
			// Next Button
			if ($.isFunction(env.params.nextBtnInsertFn)) {
				env.$elts.nextBtn = env.params.nextBtnInsertFn(env.$elts);
			} else {
				if (params.btnsPosition == "outside"){
					env.$elts.nextBtn = $(params.nextBtn)[params.nextBtnInsert](env.$elts.carousel);
				} else {
					env.$elts.nextBtn = $(params.nextBtn)[params.nextBtnInsert](env.$elts.wrap);
				}
			}
			
			// Add buttons classes / data
			env.$elts.nextBtn.addClass("carousel-control next carousel-next");
			env.$elts.prevBtn.addClass("carousel-control previous carousel-previous");
			
			// Last items to load in ajaxMode var
			env.lastItemsToLoad;
			
			// Bind events on next / prev buttons
			initButtonsEvents(env);
			
			// Bind events on focus for keyboard control
			env.$elts.carousel.attr('tabindex',0).add(env.$elts.carousel.children()).bind({
				focus : function(e){
					$(document).bind('keypress', function(e){
						switch (e.keyCode) {
							case 39 : env.$elts.nextBtn.click(); break;
							case 37 : env.$elts.prevBtn.click(); break;
						}
						switch (e.charCode) {
							case 110 : env.$elts.nextBtn.click(); break;
							case 112 : env.$elts.prevBtn.click(); break;
						}
					});
				}, 
				blur : function(){
					$(document).unbind('keypress');
				}
			});
			
			// Address plugin
			initAddress(env);
			
			// On document load...
			$(function(){
				
				// Launch carousel initialization
				initCarousel(env);
				
				// Launch function added to "document ready" event
				$.each(env.launchOnLoad, function(i,fn){
					fn();
				});
				
				// Launch autoslide
				if (env.params.autoSlide){
					initAutoSlide(env);
				}
				
				// Control Slide Button
				if(params.stopSlideBtn == true){
					env.$elts.stopSlideBtn = $('<button type="button" class="slide-control play">'+params.stopSlideTextPause+'</button>');
					createBtnStopAutoslide(env);
				}
				
			});
			
		});
		
	};
	
	// Init carousel dimensions
	function initCarousel(env){
		//Set max Height with the highest element
		var $items = env.$elts.content.children();
		var $maxHeight = 0;
		
		$items.each(function () {
			$item = $(this);
			$itemHeight = $item.outerHeight();
			if ($itemHeight > $maxHeight) {
				$maxHeight = $itemHeight;
			}
		});
		if (env.params.verticalMargin > 0) {
			$maxHeight = $maxHeight + env.params.verticalMargin;
		}
		
		$items.height($maxHeight);
		// First item
		var $firstItem = env.$elts.content.children(":first");
		
		// Width 1/1 : Get default item width
		env.itemWidth = $firstItem.outerWidth();
		
		// Width 2/3 : Define content width
		if (env.params.direction == "vertical"){
			env.contentWidth = env.itemWidth;
			
		} else {
			
			if (env.params.equalWidths) {
				env.contentWidth = env.itemWidth * env.steps.count;
				
			} else {
				env.contentWidth = (function(){
						var totalWidth = 0;
						
						env.$elts.content.children().each(function(){
							totalWidth += $(this).outerWidth();
						});
						
						return totalWidth;
					})();
			}
		}
		
		// Width 3/3 : Set content width to container
		env.$elts.content.width(env.contentWidth);
		
		// Height 1/2 : Get default item height
		env.itemHeight = $maxHeight;
		
		// Height 2/2 : Set content height to container
		if (env.params.direction == "vertical") {
			env.$elts.content.css({
				height: env.itemHeight * env.steps.count + "px"
			});
			env.$elts.content.parent().css({
				height: env.itemHeight * env.params.dispItems + "px"
			});
		} else {
			env.$elts.content.parent().css({
				height: env.itemHeight + "px"
			});
		}
		
		// Update Next / Prev buttons state
		updateButtonsState(env);
	}
	
	// Next / Prev buttons events only
	function initButtonsEvents(env){
	
		env.$elts.nextBtn.add(env.$elts.prevBtn)
			
			.bind("enable", function(){
				
				var $this = $(this)
					.unbind("click")
					.bind("click", function(){
						// Ajax init
						if(env.params.ajaxMode && $this.is('.next') && getActivePageIndex(env) == (getPageTotal(env)-1) && !env.lastItemsToLoad) {
							// Append content in ajax
							ajaxLoad(env);
							// Go to next page of the carousel
							env.$elts.content.ajaxSuccess(function() {
															
							});
						}else{							
							goToStep( env, getRelativeStep(env, ($this.is(".next")? "next" : "prev" )) );
							
							if(env.params.stopSlideBtn == true){
								env.$elts.stopSlideBtn.trigger('pause');
							} else {
								stopAutoSlide(env);
							}
						}						
					})
					.removeClass("disabled").removeAttr('disabled');
				
				// Combined classes (IE6 compatibility)
				if (env.params.combinedClasses) {
					$this.removeClass("next-disabled previous-disabled").removeAttr("disabled");
				}
			})
			.bind("disable", function(){
				
				var $this = $(this).unbind("click").addClass("disabled").attr("disabled","disabled");
				
				// Combined classes (IE6 compatibility)
				if (env.params.combinedClasses) {
					
					if ($this.is(".next")) {
						$this.addClass("next-disabled");
						
					} else if ($this.is(".previous")) {
						$this.addClass("previous-disabled");
						
					}
				}
			})
			.hover(function(){
				$(this).toggleClass("hover");
			});
	};
	
	// Pagination
	function initPagination(env) {
			env.$elts.pagination = $('<div class="center-wrap"><div class="carousel-pagination"><p></p></div></div>')[((env.params.paginationPosition == "outside") ? "insertAfter" : "appendTo")](env.$elts.carousel).find("p");
			env.$elts.paginationBtns = $([]);

			env.$elts.content.find("li").each(function (i) {
				if (i % env.params.dispItems == 0) {
					addPage(env, i);
				}
			});
    };
	
	// Add a page in pagintion (@ the end)
	function addPage(env, firststep) {
		if(env.params.pagination){
			env.$elts.paginationBtns = env.$elts.paginationBtns.add($('<a role="button"><span>' + env.params.tabLabel(env.$elts.paginationBtns.length + 1) + '</span></a>').data("firstStep", firststep))
			.appendTo(env.$elts.pagination);
			env.$elts.paginationBtns.slice(0, 1).addClass("active");
			env.$elts.paginationBtns.click(function (e) {
				goToStep(env, $(this).data("firstStep"));
				if(env.params.stopSlideBtn == true){
					env.$elts.stopSlideBtn.trigger('pause');
				} else {
					stopAutoSlide(env);
				}
			});
		}
	}
	
	// Address plugin
	function initAddress(env) {
		
		if (env.params.useAddress && $.isFunction($.fn.address)) {
			
			$.address
				.init(function(e) {
					var pathNames = $.address.pathNames();
					if (pathNames[0] === env.params.adressIdentifier && !!pathNames[1]) {
						goToStep(env, pathNames[1]-1);
					} else {
						$.address.value('/'+ env.params.adressIdentifier +'/1');
					}
				})
				.change(function(e) {
					var pathNames = $.address.pathNames();
					if (pathNames[0] === env.params.adressIdentifier && !!pathNames[1]) {
						goToStep(env, pathNames[1]-1);
					}
				});
		} else {
			env.params.useAddress = false;
		}
	};
	
	function goToStep(env, step) {
		
		// Callback
		env.params.callback(step);
		
		// Launch animation
		transition(env, step);
		
		// Update first step
		env.steps.first = step;
		
		// Update buttons status
		updateButtonsState(env);
		
		// Update address (jQuery Address plugin)
		if ( env.params.useAddress ) {
			$.address.value('/'+ env.params.adressIdentifier +'/' + (step + 1));
		}
		
	};
	
	// Get next/prev step, useful for autoSlide
	function getRelativeStep(env, position) {
		if (position == "prev") {
			if (!env.params.showEmptyItems) {
				if (env.steps.first == 0) {
					return ((env.params.loop) ? (env.steps.count - 1) : false);
				} else {
					return Math.max(0, env.steps.first - 1);
				}
			} else {
				if ((env.steps.first - 1) >= 0) {
					return env.steps.first - 1;
				} else {
					return ((env.params.loop) ? (env.steps.count - 1) : false);
				}
			}
		} else if (position == "next") {
			if ((env.steps.first + env.params.dispItems) < env.steps.count) {
				if (!env.params.showEmptyItems) {
					return Math.min(env.steps.first + 1, env.steps.count - 1);
				} else {
					return env.steps.first + 1;
				}
			} else {
				return ((env.params.loop) ? 0 : false);
			}
		}
	};
	
	// Animation
	function transition(env, step) {
		
		// Effect
		switch (env.params.effect){
			
			// No effect
			case "no":
				if (env.params.direction == "vertical"){
					env.$elts.content.css("top", -(env.itemHeight * step) + "px");
				} else {
					env.$elts.content.css("left", -(env.itemWidth * step) + "px");
				}
				break;
			
			// Fade effect
			case "fade":
				if (env.params.direction == "vertical"){
					env.$elts.content.hide().css("top", -(env.itemHeight * step) + "px").fadeIn(env.params.animSpeed);
				} else {
					env.$elts.content.hide().css("left", -(env.itemWidth * step) + "px").fadeIn(env.params.animSpeed);
				}
				break;
			
			// Slide effect
			default:
				if (env.params.direction == "vertical"){
					env.$elts.content.stop().animate({
						top : -(env.itemHeight * step) + "px"
					}, env.params.animSpeed, env.params.slideEasing);
				} else {
					env.$elts.content.stop().animate({
						left : -(env.itemWidth * step) + "px"
					}, env.params.animSpeed, env.params.slideEasing);
				}
				break;
		}
		
	};
	
	// Update all buttons state : disabled or not
	function updateButtonsState(env){
		
		if (getRelativeStep(env, "prev") !== false) {
			env.$elts.prevBtn.trigger("enable");
			
		} else {
			env.$elts.prevBtn.trigger("disable");
		}
		
		if (getRelativeStep(env, "next") !== false) {
			env.$elts.nextBtn.trigger("enable");
			
		} else {
			env.$elts.nextBtn.trigger("disable");
		}
		
		if (env.params.pagination){
			env.$elts.paginationBtns.removeClass("active")
			.filter(function(){ 			
				return ($(this).data("firstStep") == env.steps.first) 
			})
			.addClass("active");
		}
	};	
	
	// Launch Autoslide
	function initAutoSlide(env) {
		env.delayAutoSlide = window.setTimeout(function(){
			env.autoSlideInterval = window.setInterval(function(){
				goToStep( env, getRelativeStep(env, "next") );
			}, env.params.autoSlideInterval);
		}, env.params.delayAutoSlide);
	};
	
	// Stop autoslide
	function stopAutoSlide(env) {
		window.clearTimeout(env.delayAutoSlide);
		window.clearInterval(env.autoSlideInterval);
		env.params.delayAutoSlide = 0;
	};
	
	// Create button "stop autoslide"
	function createBtnStopAutoslide(env){
		var jButton = env.$elts.stopSlideBtn;
		
		jButton.bind({
			'play' : function(){
				initAutoSlide(env);
				jButton.removeClass('pause').addClass('play').html(env.params.stopSlideTextPause);
			}, 
			'pause' : function(){
				stopAutoSlide(env);
				jButton.removeClass('play').addClass('pause').html(env.params.stopSlideTextPlay);
			}
		});
		
		jButton.click(function(e){
			if(jButton.is('.play')){
				jButton.trigger('pause');
			} else if (jButton.is('.pause')){
				jButton.trigger('play');
			}
		});
		
		jButton.prependTo(env.$elts.wrap);
	};
	
	// Get total number of page in the carousel
	function getPageTotal(env) {
		return env.$elts.pagination.children().length;
	};
	
	function getActivePageIndex(env){
		return env.steps.first/env.params.dispItems;
	}
	
	// Load next page via Ajax
	function ajaxLoad(env) {
		// insert loader
		env.$elts.carousel.prepend(env.$elts.loader);
		
		// ajax call				
		$.ajax({
			url: env.params.ajaxUrl,
			dataType: 'json',
			success: function(data) {
				// set if the last item of the carousel have been loaded and add items to the carousel
				env.lastItemsToLoad = data.bLastItemsToLoad;
				$(env.$elts.content).append(data.shtml);
				
				// reinit count (number of items have changed after ajax call)
				env.steps = {
					first: env.steps.first + env.params.dispItems,
					count: env.$elts.content.children().length
				};
				env.steps.last = env.steps.count - 1;
				
				// rewrite carousel dimensions
				initCarousel(env);
				// rewrite/append pagination
				addPage(env,env.steps.first);
				
				// slide to next page
				goToStep( env, env.steps.first );
				if(env.params.stopSlideBtn == true){
					env.$elts.stopSlideBtn.trigger('pause');
				} else {
					stopAutoSlide(env);
				}
				
				// remove loader
				env.$elts.loader.remove();
			}
		});		
	}
	
})(jQuery, App.global.window, App.global.window.document);
/**
 * @version 1.0.120606
 * @description Header-Content-Footer Layout library for mediaquery resize processing.
 */

var HCF = function(options) {
	// Задаем значения по умолчанию
	this.styles = null;
	this.header = null;
	this.footer = null;
	this.active = false;
	this.contents = null;
	this.isSupportMQ = false;
	this.hasHeightTable = false;
	this.options = options || {};
	this.maxHeight = screen.height;
	this.headerHeight = this.footerHeight = 0;

	// Инициализируем библиотеку
	this.init();

	// Возвращаем объект с набором доступных для пользователя методов
	return {
		stop: this.getFn('stop'),
		start: this.getFn('start'),
		recheck: this.getFn('recheck'),
		elements: {
			header: this.header,
			contents: this.contents,
			footer: this.footer
		}
	}
};

HCF.prototype = {
	/**
	 * @description Метод инициализации работы библиотеки.
	 */
	init: function() {
		var processBlock = function(block) {
				if (block) {
					if (typeof(block) === 'string') {
						return $(block);
					} else if (block instanceof $) {
						var list = null;

						if (block.length > 1) {
							for (var i = 0, length = block.length, item; i < length; i++) {
								item = block.eq(i);

								if (!list) {
									list = processBlock(item)
								} else {
									list = list.add(processBlock(item));
								}
							}
						} else {
							list = block;
						}
						return list;
					}
				}
				return block;
			};

		this.id = +new Date();

		// Из переданных селекторов получаем jq объекты для дальнейшей работы с ними
		this.header = processBlock(this.options.header).first();
		this.contents = processBlock(this.options.contents);
		this.footer = processBlock(this.options.footer).first();

		// Проверяем поддерживает ли тикущий браузер media queries
		this.isSupportMQ = this.checkMQ();

		// Если в опциях не передали отложенный запуск, то запускаем обработчики событий
		if (!this.options.deferred) {
			// Навешиваем событие на изменение размера окна браузера и запускаем механизм расчета высоты блоков
			this.start();
		}
	},

	start: function() {
		if (!this.active) {
			this.active = true;
			$(window).on('resize.hcf-' + this.id, this.getFn('recheck'));
			this.recheck();
		}
	},

	stop: function() {
		this.active = false;
		$(window).off('.hcf-' + this.id);
		this.removeHeightTable();
	},

	/**
	 * @description Проверяет поддержку media queries браузером.
	 * @returns {Bool} Флаг говорящий о поддержки браузером media queries.
	 */
	checkMQ: function() {
		var dummy = $('<div id="mq-test-dummy">'),
			style = $('<style type="text/css">@media only all{#mq-test-dummy{width:10px}}</style>'),
			support = false;

		dummy
			.css({
				'top': -1000,
				'position': 'absolute'
			})
			.appendTo('body');
		style.appendTo('head');

		if (dummy.width() == 10) {
			support = true;
		}
		dummy.remove();
		style.remove();
		return support;
	},

	/**
	 * @description Метод возвращающий ссылку на вызов переданного метода в текущем контексте.
	 * @param {String} name Имя метода на которой нужно сделать ссылку с локальным контекстом.
	 * @returns {Function} Функция ссылающаяся на указанную функция в текущем контексте.
	 */
	getFn: function(name) {
		var fn = this[name],
			context = this;

		return function() {
			if (typeof(fn) === 'function') {
				return fn.apply(context, arguments);
			}
		}
	},

	/**
	 * @description Метод делающий нужные проверки во избежания лишних перерасчетов, если это возможно.
	 */
	recheck: function(forceRecheck) {
		if (this.active || forceRecheck) {
			var header = this.header,
				footer = this.footer,
				headerHeight = header.outerHeight(),
				footerHeight = footer.outerHeight();

			// Проверяем поддержку mq браузером
			if (this.isSupportMQ) {
				// Если браузер поддерживает mq, то проверяем не изменились ли высоты шапки и футера.
				// Если изменились, то удаляем старые стили и выставляем флаг на перерасчет новых стилей.
				if (!this.headerHeight || this.headerHeight != headerHeight) {
					this.headerHeight = headerHeight;
					this.removeHeightTable();
				}

				if (!this.footerHeight || this.footerHeight != footerHeight) {
					this.footerHeight = footerHeight;
					this.removeHeightTable();
				}
			} else {
				this.headerHeight = headerHeight;
				this.footerHeight = footerHeight;
				this.removeHeightTable();
			}

			// Если старые стили были удалены то собираем новые
			if (!this.hasHeightTable) {
				this.createHeightTable();
			}
			return true;
		}
		return false;
	},

	/**
	 * @description Метод в зависимости от поддержки mq либо генерирует таблицу стилей либо через js выставляет
	 *              высоту блоку.
	 * @param {Object} target Элемент в который нужно вставить сгенерированные стили.
	 */
	generateHeightTable: function(target) {
		var diffHeight = this.headerHeight + this.footerHeight;

		if (this.isSupportMQ) {
			// Получаем селекторы для блоков контентной части
			var selectors = typeof(this.options.contents) === 'string' ? this.options.contents : (!!this.options.contents.join && this.options.contents.join(', ')),
				styles = '';

			if (!selectors) {
				selectors = '.hcf-' + this.id;
				this.contents.addClass(selectors.slice(1));
			}
			styles += selectors + '{height:0px} ';

			// Если селекторы были получены, то генерируем таблицу стилей
			for (var i = diffHeight ; i < this.maxHeight; i++) {
				styles += '@media screen and (height:' + i + 'px){' + selectors + '{height:' + (i - diffHeight) + 'px}} ';
			}
			// После генерации вставляем стили в переданный DOM элемент
			target.html(styles);
		} else {
			var sizes = this.getBrowserSizes();

			// Высчитываем и выставляем высоту блока контентной части
			this.contents.height(sizes.y - diffHeight);
		}
	},

	/**
	 * @description Метод возвращающий размеры окна браузера.
	 * @returns {Object} Объект с ключами x и y содержащие значения ширины и высоты окна браузера соответственно.
	 */
	getBrowserSizes: function() {
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0];

		return {
			x: w.innerWidth || e.clientWidth || g.clientWidth,
			y: w.innerHeight || e.clientHeight || g.clientHeight
		}
	},

	createHeightTable: function() {
		if (this.isSupportMQ) {
			this.styles = $('<style type="text/css">');
			this.generateHeightTable(this.styles);
			this.styles.appendTo('head');
		} else {
			this.generateHeightTable();
		}
		this.hasHeightTable = true;
	},

	removeHeightTable: function() {
		this.styles && this.styles.remove();
		this.hasHeightTable = false;
	}
}
$.mockJSON.random = false;
$.mockJSON(/Get\/Alternatives/, {
	'Success': true,
	'Response|5-10': [{
		'image': 'static/img/photos/product_1.jpg',
		'price|1000-9000': 0
	}]
});
App.Helpers.push(function(Handlebars, utils) {
	var photo = utils.templates.photo,
		switcher = utils.templates.switcher,
		infoPhoto = utils.templates.infoPhoto;

	if (photo) {
		Handlebars.registerHelper('photo', function(data, options) {
			data || (data = {});
			options || (options = {});

			for (var key in options.hash) {
				if (options.hash.hasOwnProperty(key)) {
					data[key] = options.hash[key];
				}
			}

			// Для унификации работы с шаблоном прокидываем объект position в основной объект
			if (data.position != null) {
				for (key in data.position) {
					if (data.position.hasOwnProperty(key)) {
						data[key] = data.position[key];
					}
				}
			}

			// Добавление обработки итеративных классов для ускорения выборок DOM элементов с кешированием
			if (data.iterateClass != null) {
				if (typeof(data.className) !== 'string') {
					options.hash.className = '';
				}
				data.className += ' b-photo-id' + data.id;
			}
			return new Handlebars.SafeString(photo(data));
		});
	}

	if (switcher) {
		Handlebars.registerHelper('switcher', function(data) {
			return new Handlebars.SafeString(switcher(data));
		});
	}

	if (infoPhoto) {
		Handlebars.registerHelper('infoPhoto', function(data) {
			return new Handlebars.SafeString(infoPhoto(data));
		});
	}
});