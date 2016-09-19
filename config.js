app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/entry/:entryId', {
        templateUrl: 'templates/entry.html',
        controller: 'BlogReadCtrl',
        controllerAs: 'ctrl'
      })
      .when('/entry/:entryId\/edit', {
        templateUrl: 'templates/edit.html',
        controller: 'BlogEditCtrl',
        controllerAs: 'ctrl'
      })
      .when('/', {
        templateUrl: 'templates/list.html',
        controller: 'BlogListCtrl',
        controllerAs: 'ctrl'
      })
      .when('/entry/:entryID\/delete', {
        templateUrl: 'templates/entry.html',
        controller: 'BlogDeleteCtrl',
        controllerAs: 'ctrl'
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
