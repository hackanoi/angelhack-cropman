// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ngResource'])

.run(function($ionicPlatform, RiceMan) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if(window.cordova && window.cordova.plugins.backgroundMode) {
      /*document.addEventListener('deviceready', function () {
        // Enable background mode
        cordova.plugins.backgroundMode.enable();

        // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function () {
          setTimeout(function () {
            RiceMan.background_mode();
          }, 10000);
        }
      }, false);*/
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'appCtrl'
  })
  // Dashboard state.
  .state('app.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  // Sign in state.
  .state('app.signin', {
    url: '/sign-in',
    views: {
      'menuContent': {
        templateUrl: 'templates/sign-in.html',
        controller: 'SignInCtrl'
      }
    }
  })
  // Sign up state
  .state('app.signup', {
    url: '/sign-up',
    views: {
      'menuContent': {
        templateUrl: 'templates/sign-up.html',
        controller: 'SignUpCtrl'
      }
    }
  })
  // Projects state.
  .state('app.projects', {
    url: '/projects',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-projects.html',
        controller: 'ProjectCtrl'
      }
    }
  })

/*  .state('app.monitor', {
    url: '/monitor-growth',
    views: {
      'menuContent': {
        templateUrl: 'templates/monitor-growth.html',
        controller: 'MonitorCtrl'
      }
    }
  })*/
  .state('app.project', {
    url : '/project/:pid',
    views: {
      'menuContent': {
        templateUrl : 'templates/projects-detail.html',
        resolve: {
          projectinfo: function($http, $stateParams){
            return $http.get('http://ricedata.hackanoi.com/api/v1/node/' + $stateParams.pid)
            .then(function(response){
              return response.data;
            });
          }
        },
        controller : 'ProjectDetailController',
      }
    }
  })

  .state('app.images', {
    url : '/image/:id',
    views: {
      'menuContent': {
        templateUrl : 'templates/image-detail.html',
        controller : 'ImageDetailController'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/dash');
  $ionicConfigProvider.tabs.position('bottom');
});
