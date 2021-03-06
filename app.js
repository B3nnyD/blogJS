var app = angular.module('blogJS', ['ngRoute','infinite-scroll']);

// Controler for main page with list of all entries
app.controller('BlogListCtrl', ['$scope', '$http', '$route',
	function($scope, $http, $route) {
		var ctrl = this;
		ctrl.entries = [];
		ctrl.entriesVisible = [];
		var entriesSorted = [];
		$scope.loadBlog = function(){
			for (var key in localStorage) {
				if (key.slice(0,6) === 'entry_') {
					ctrl.entries[ctrl.entries.length] = JSON.parse(localStorage.getItem(key));
				}
			};

			//add examples if no entries:
			if (ctrl.entries.length == 0) {
				$http({
					method: 'GET',
					url: 'example.json',
					cache: 'false',
				}).then(function successCallback(response) {
					//	ctrl.entries = ctrl.entries.concat(response.data);
					var newContent = false;
					for (var key in response.data) {
						if (localStorage.getItem("entry_" + response.data[key].id) == null) {
							localStorage.setItem("entry_" + response.data[key].id, JSON.stringify(response.data[key]));
							newContent = true;
						}
					}
					if (newContent) {$route.reload()};
				}, function errorCallback(response) {
					console.log('error - example json not loaded!');
					console.log(response);
				});
			};

			// sort entries by date (needed for infiniteScroll)
			var keys = [];
			for (var i = ctrl.entries.length - 1; i >= 0; i--) {
				keys.push(ctrl.entries[i].created + "~" + i.toString());
			}
			keys.sort();
			keys.reverse();
			for (var i = 0; i < keys.length; i++) {
				entriesSorted.push( ctrl.entries[ Number(keys[i].split('~')[1]) ] );
				if (i < 3) {
					ctrl.entriesVisible.push(entriesSorted[i])
				}
			}
			ctrl.entries = entriesSorted;
		};

		$scope.loadMore = function(){
			var last = ctrl.entriesVisible.length - 1;
			if (last+1 >= ctrl.entries.length) {
				$scope.endOfData = true;
			} else {
				$scope.endOfData = false;
				for(var i = 1; i <= 2; i++) {	//load two more entries...
					if (last + i <= ctrl.entries.length - 1){	//...if available...
					 	ctrl.entriesVisible.push(ctrl.entries[last+i])
					} else {	//...else stop infiniteScroll
					 	$scope.endOfData = true;
					}
				}
			}			
		};

	}
]);

// Controller for opened blog entry in read mode
app.controller('BlogReadCtrl', ['$scope', '$route', '$location',
	function($scope, $route, $location) {
		var ctrl = this;
		var readEntryTmp = '';
		var readEntry = {};
		var assignID = '';

		$scope.loadContent = function(){
			assignID = $route.current.pathParams.entryId || '0';
			readEntryTmp = localStorage.getItem("entry_" + assignID);
			if (readEntryTmp===null) {
				// invalid ID?
				console.log(assignID + ' could not be loaded.');
				$location.url('/');
			} else {
				readEntry = JSON.parse(readEntryTmp);
				ctrl.created = readEntry.created;
				ctrl.author = readEntry.author;
				$scope.title = readEntry.title;
				$scope.entry = readEntry.entry;
			}
		}
	}
]);

// Controller for opened blog entry in edit mode or for new blog entry
app.controller('BlogEditCtrl', ['$scope', '$route', '$location', 
	function($scope, $route, $location) {
		var ctrl = this;
		var editEntry = {};
		var assignID = '';
		ctrl.author = "Anonymous"; //until authorisation is implemented
		ctrl.created = Date.now();

		$scope.loadContent = function(){
			//existing entry or new?
			assignID = $route.current.pathParams.entryId || '0';

			if (assignID == 0 || localStorage.getItem("entry_" + assignID) == null) {
				//new entry
				var tmpID = Math.random().toString(36).substring(2,6);
				do {
					if (localStorage.getItem("entry_" + tmpID) == null) {
						assignID = tmpID;
					} else {
						tmpID = Math.random().toString(36).substring(2,6);
					}
				}
				while (assignID == 0);
			} else {
				editEntry = JSON.parse(localStorage.getItem("entry_" + assignID));
				ctrl.created = editEntry.created;
				ctrl.author = editEntry.author;
				$scope.title = editEntry.title;
				$scope.entry = editEntry.entry;
			}
		};

		$scope.onSubmit = function(){
			editEntry.id = assignID;
			editEntry.title = $scope.title;
			editEntry.entry = $scope.entry;
			editEntry.created = ctrl.created;
			editEntry.author = ctrl.author;
			setTimeout(function(){localStorage.setItem("entry_" + assignID, JSON.stringify(editEntry));$location.path('/entry/' + assignID);$route.reload();},0)
			
		};

	}
]);

// Controller for infopanel, shared on all pages
app.controller('BlogInfoPanel', ['$scope', '$location', '$route',
	function($scope, $location, $route) {
		$scope.$on("$routeChangeSuccess", function () {
			var currUrl = $location.url().toLowerCase();
			if (currUrl.indexOf('/edit') > -1) {
				$scope.entryMode = 'edit';
			} else if (currUrl.indexOf('/entry') > -1) {
				$scope.entryMode = 'read';
			} else {
				$scope.entryMode = '';
			}
		});

		$scope.readLocalStorage = function(){
			console.log(localStorage)
		};
		$scope.clearLocalStorage = function(){
			if(confirm('Delete all entries and load default examples?')){
				localStorage.clear();
				$location.path('/');
				$route.reload();
			};
		};
		$scope.editEntry = function(){
			$location.url($location.url() + "/edit");
		};

		$scope.deleteEntry = function(){
			if(confirm('Delete this entry?')){
				$location.url($location.url() + "/delete");
			};
		};
		
	}
]);

// Controller for deletion of blog entry
app.controller('BlogDeleteCtrl', ['$scope', '$location', '$route',
	function($scope, $location, $route) {
		var assignID = $route.current.pathParams.entryID;
		if (assignID!='') {
				setTimeout(function(){localStorage.removeItem("entry_" + assignID);$route.reload();},0);
		}
		$location.path('/');
	}
]);

// Prevent submit on enter in title input field
$(document).ready(function(){
	$(document).on("keypress", "input:not(textarea):not([type=submit])", function(e) {
		var key = e.which || e.keyCode || 0;
		if (key===13) {
			e.preventDefault();
		}
	});
});