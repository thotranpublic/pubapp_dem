/**
	app.js the angular app code, it has code to handle routing. 
	Also little bit of code to set the page title and to dynamically load scripts for views.
**/

(function() {
	var app = angular.module('app', ['ui.router', 'nav', 'articlelist', 'articledetails', 'accountDetails', 'angular-inview', 'ngAnimate', 'ui.bootstrap', 'duScroll'])

	// define for requirejs loaded modules
	define('app', [], function() { return app; });

	// function for dynamic load with requirejs of a javascript module for use with a view
	// in the state definition call add property `resolve: req('/views/ui.js')`
	// or `resolve: req(['/views/ui.js'])`
	// or `resolve: req('views/ui')`
	function req(deps) {
		if (typeof deps === 'string') deps = [deps];
		return {
			deps: function ($q, $rootScope) {
				var deferred = $q.defer();
				require(deps, function() {
					$rootScope.$apply(function () {
						deferred.resolve();
					});
					deferred.resolve();
				});
				return deferred.promise;
			}
		}
	}

	app.config(function($stateProvider, $urlRouterProvider, $controllerProvider){
		var origController = app.controller
		app.controller = function (name, constructor, $rootScope){
			$controllerProvider.register(name, constructor);
			return origController.apply(this, arguments);
		}

		var viewsPrefix = 'views/';

		// For any unmatched url, send to /
		$urlRouterProvider.otherwise("/")

		$stateProvider
			// you can set this to no template if you just want to use the html in the page
			.state('home', {
				url: "/",
				templateUrl: viewsPrefix + "home.html",
				data: {
					pageTitle: 'Home',
				},
				controller: 'articleListController'
			})
			.state('article_details', {
				url: "/article_details",
				templateUrl: viewsPrefix + "article_details.html",
				controller: 'articleDetailsController',
				data: {
					pageTitle: 'Article details',
				},
			})
			.state('login', {
				url: "/login",
				templateUrl: viewsPrefix + "login.html",
				controller: 'accountsController',
				data: {
					pageTitle: 'Login',
				},
			})
			.state('register', {
				url: "/register",
				templateUrl: viewsPrefix + "register.html",
				controller: 'accountsController',
				data: {
					pageTitle: 'Register',
				},
			})
	})
	.directive('updateTitle', ['$rootScope', '$timeout',
		function($rootScope, $timeout) {
			return {
				link: function(scope, element) {
					var listener = function(event, toState) {
						var title = 'PubApp';
						if (toState.data && toState.data.pageTitle) title = toState.data.pageTitle + ' - ' + title;
						$timeout(function() {
							element.text(title);
						}, 0, false);
					};

					$rootScope.$on('$stateChangeSuccess', listener);
				}
			};
		}
	])
	.controller('appController', function ($scope, $rootScope, $document) {

        $rootScope.SITE_TITLE = "PUBAPP";
        $rootScope.SITE_TITLE_FIRST = "Pub";
        $rootScope.SITE_TITLE_SECOND = "App";

        $rootScope.YEAR = "2017";

        $rootScope.backEndUrl = "http://localhost:8888/";

        $scope.scrollToCustomPos = function(position) {
	        var pos = position;
		    var duration = 2000; //milliseconds

		    //Scroll to the exact position
		    $document.scrollTop(pos, duration);
		};

		$rootScope.$on('$stateChangeSuccess', function() {
		   document.body.scrollTop = document.documentElement.scrollTop = 0;
		});
	})
	.service('articleListService', ['$http', '$rootScope', function($http, $rootScope) {
	    
	    function getAllArticles() {
	    	return $http.get("http://localhost:8888/api/articles", {});
	    }

	    function getComments() {
	    	return $http.get("http://localhost:8888/api/comments", {});
	    }

	    function uploadComment(comment) {
	    	return $http.post("http://localhost:8888/api/comments", comment, {});
	    }

	    function setActiveArticle(article) {
	    	localStorage.setItem('activeArticle', JSON.stringify(article));
	    }

	    function getActiveArticle() {
	    	return JSON.parse(localStorage.getItem('activeArticle'));
	    }

	    return {
	    	getAllArticles: getAllArticles,
	    	setActiveArticle: setActiveArticle,
	    	getActiveArticle: getActiveArticle,
	    	getComments: getComments,
	    	uploadComment: uploadComment
	    }
	}])
	.service('utilService', ['$http', '$rootScope', function($http, $rootScope) {
	    
	    var days = {
			0: 'Sunday',
			1: 'Monday',
			2: 'Tuesday',
			3: 'Wednesday',
			4: 'Thursday',
			5: 'Friday',
			6: 'Saturday'
		};
	
	    function convertToReadableDate(dateStr) {
			var date = new Date(dateStr)
			var date2 = date.toDateString().split(' ');
			var readable = days[date.getDay()] + ' ' + date2[1] + ' ' + date2[2] + ', ' + date2[3];
			return readable;
		};

		function isEmpty(obj) {
		    return Object.keys(obj).length === 0;
		}
	
		function likeArticle(articleID) {

			var retrievedObject = JSON.parse(localStorage.getItem('likesStorageItem'));
			
			if(!retrievedObject) {
				console.log("User did not like anything on page yet...");
				retrievedObject = {};
				return;
			}

			if(isEmpty(retrievedObject)) {
				retrievedObject[articleID + ''] = true;
			} else if(!retrievedObject.hasOwnProperty(articleID + '')) {
				retrievedObject[articleID + ''] = true;
			}

			localStorage.setItem('likesStorageItem', JSON.stringify(retrievedObject));
		};

		function unlikeArticle(articleID) {

			var retrievedObject = JSON.parse(localStorage.getItem('likesStorageItem'));
			if(isEmpty(retrievedObject)) {
				console.log("nothing to unlike");
				return;
			}

			if(retrievedObject.hasOwnProperty(articleID)) {
				delete retrievedObject[articleID];
				localStorage.setItem('likesStorageItem', JSON.stringify(retrievedObject));
			}
		};

	    return {
	    	convertToReadableDate: convertToReadableDate,
	    	likeArticle: likeArticle,
	    	unlikeArticle: unlikeArticle
	    }
	}])
;}());


/***********************************
	HIDE NAV BAR WHEN SCROLL DOWN
***********************************/
$(document).ready(function() {
  
  $(window).scroll(function () {
    if ($(window).scrollTop() >= 106) {
      $('#themesBar').addClass('navbar-fixed-top');
    }
    if ($(window).scrollTop() < 106) {
      $('#themesBar').removeClass('navbar-fixed-top');
    }
  });
});

/***********************************
	    SCROLL TO TOP BUTTON
***********************************/
$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
        $('#return-to-top').fadeIn(200);    // Fade in the arrow
    } else {
        $('#return-to-top').fadeOut(200);   // Else fade out the arrow
    }
});


/***********************************
        SEARCH BUTTON
***********************************/
;( function( window ) {
	
	function UISearch( el, options ) {	
		this.el = el;
		this.inputEl = el.querySelector( 'form > input.sb-search-input' );
		this._initEvents();
	}

	UISearch.prototype = {
		_initEvents : function() {
			var self = this,
				initSearchFn = function( ev ) {
					if( !classie.has( self.el, 'sb-search-open' ) ) { // open it
						ev.preventDefault();
						self.open();
					}
					else if( classie.has( self.el, 'sb-search-open' ) && /^\s*$/.test( self.inputEl.value ) ) { // close it
						self.close();
					}
				}

			this.el.addEventListener( 'click', initSearchFn );
			this.inputEl.addEventListener( 'click', function( ev ) { ev.stopPropagation(); });
		},
		open : function() {
			classie.add( this.el, 'sb-search-open' );
		},
		close : function() {
			classie.remove( this.el, 'sb-search-open' );
		}
	}

	// add to global namespace
	window.UISearch = UISearch;

} )( window );

document.onload = function()
{

	function msieversion() {

	    var ua = window.navigator.userAgent;
	    var msie = ua.indexOf("MSIE ");

	    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
	    {
	        alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
	    }
	    else  // If another browser, return 0
	    {
	        alert('otherbrowser');
	    }

	    return false;
	}

	if(msieversion()) {
		$('#searchInput').css('min-width', '200px');
		$('#searchInput').css('width', '200px');
		$('#searchInput').css('max-width', '200px');
	}
}