angular.module('articlelist', [])
.controller('articleListController', ['$scope', '$rootScope', '$state', 'articleListService', 'utilService',

function($scope, $rootScope, $state, articleListService, utilService) {

	$scope.articles = [];
	
	/**
		Retrieve all articles from backend and
		place them into JSON array for showing
		on "article list" page.
	*/
	$scope.getArticles = function() {

		articleListService.getAllArticles()
			.success(function(response) {
				$scope.articles = response;
				var cookies = JSON.parse(localStorage.getItem('likesStorageItem'));

				for(var i = 0; i < $scope.articles.length; i++) {
					if(cookies.hasOwnProperty($scope.articles[i]['id'] + '')) {
						$scope.articles[i]['thumbsUp'] = true;
					}
				}

			}).error(function(response) {
				console.log(response);
			});
	};

	//$scope.getArticles();

	$scope.convertToReadableDate = function(dateStr) {
		return utilService.convertToReadableDate(dateStr);
	};

	function isEmpty(obj) {
	    return Object.keys(obj).length === 0;
	}

	$scope.toggleLikeArticle = function(article) {
		if(article.hasOwnProperty('thumbsUp')) {
			$scope.unlikeArticle(article.id);
		}
		else {
			$scope.likeArticle(article.id);
		}
	};

	$scope.likeArticle = function(articleID) {

		utilService.likeArticle(articleID);
		$scope.getArticles();
	};

	$scope.unlikeArticle = function(articleID) {
		
		utilService.unlikeArticle(articleID);
		$scope.getArticles();
	};

	$scope.getArticleDetails = function(article) {
		articleListService.setActiveArticle(article);
		$state.go('article_details');
	};

	$scope.scrollToCustomPos = function(position) {

		console.log("IN SCROLLL");
        var pos = position;
	    var duration = 2000; //milliseconds

	    //Scroll to the exact position
	    $document.scrollTop(pos, duration);
	};

	$scope.stripeFileName = function(filePath) {
		var splitStr = filePath.split(/[\\\/]/);
		var fileName = splitStr.slice(-1)[0];
		var fileNameNoExt = fileName.split(/[.]/);
		return fileNameNoExt[0];
	};
}])
;