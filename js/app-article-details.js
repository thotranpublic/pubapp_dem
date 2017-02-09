angular.module('articledetails', [])
.controller('articleDetailsController', ['$scope', '$rootScope', '$state', '$timeout', 'articleListService', 'utilService',
function($scope, $rootScope, $state, $timeout, articleListService, utilService) {

	$scope.wordsLeft = 120;
	$scope.fontSize = 18;

	$scope.incrementFont = function() {
		$scope.fontSize += 1;
	};
	$scope.decrementFont = function() {
		$scope.fontSize -= 1;
	};

	$scope.getArticle = function() {
		$scope.article = articleListService.getActiveArticle();
	};
	$scope.getArticle();

	$scope.convertToReadableDate = function(dateStr) {
		return utilService.convertToReadableDate(dateStr);
	};

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
		$scope.article['thumbsUp'] = true;
	};

	$scope.unlikeArticle = function(articleID) {
		
		utilService.unlikeArticle(articleID);
		delete $scope.article['thumbsUp'];
	};

	$scope.convertToReadableDate = function(dateStr) {
		return utilService.convertToReadableDate(dateStr);
	}


	/************** COMMENTS *****************/
	$scope.newComment = {};
	$scope.already_loaded = false;

	$scope.showComments = function() {
		$scope.showing = true;
		$scope.getComments();
	};

	$scope.hideComments = function() {
		$scope.showing = false;
	};

	function isEmpty(obj) {
	    return Object.keys(obj).length === 0;
	}

	$scope.getComments = function() {

		if($scope.already_loaded)
			return;

		$scope.showing = true;

		$timeout(function() {
			$scope.showing = false;
			articleListService.getComments()
				.success(function(response){
					$scope.comments = response;
					$scope.status_hide = true;

					for(var i = 0 ; i < $scope.comments.length; i++) {

						// if comment is empty, remove it
						if(isEmpty($scope.comments[i])) {
							$scope.comments.splice(i, 1);
						}

						$scope.comments[i]['date'] = new Date($scope.comments[i]['date']);
					}
				}).error(function(response) {
					console.log(response);
					
					$scope.alert = { type: 'danger', 
						msg: 'Uh oh, something went wrong when loading the comments!' };
				});
		}, 2000);

		$scope.already_loaded = true;
	};

	$scope.uploadNewComment = function() {

		function getMinutes(minStr) {
			if($scope.newComment.date.getMinutes() < 10) {
				return '0' + $scope.newComment.date.getMinutes();
			} else {
				return $scope.newComment.date.getMinutes();
			}
		}

		$scope.newComment.date = new Date();
		$scope.newComment.time = $scope.newComment.date.getHours() + ':' +
					getMinutes();

		console.log($scope.newComment);

		articleListService.uploadComment($scope.newComment)
			.success(function(response) {
				$scope.getComments();
			}).error(function(response) {
				console.log(response);
			});
	};

	$scope.checkWordLen = function(len) {
		var wordLen = 120,
		len; // Maximum word length
	
		len = $('#comment_body').val().split(/[\s]+/);
		if (len.length > wordLen) { 
			if ( event.keyCode == 46 || event.keyCode == 8 ) { // Allow backspace and delete buttons
		    } else if (event.keyCode < 48 || event.keyCode > 57 ) { //all other buttons
		    	event.preventDefault();
		    }
		}

		$scope.wordsLeft = (wordLen) - len.length;
		$('.words-left').html($scope.wordsLeft+ ' words left');
		if($scope.wordsLeft == 0) {
			$('.words-left').css({
				'background':'red'
			}).prepend('<i class="fa fa-exclamation-triangle"></i>');
		}

	};

}]);