// Ionic Starter App

angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('your_app_name', ['ionic', 'angularMoment', 'your_app_name.controllers', 'your_app_name.directives', 'your_app_name.filters', 'your_app_name.services', 'your_app_name.factories', 'underscore', 'ngMap', 'leaflet-directive', 'ngResource', 'ngCordova', 'templates', 'slugifier'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('walkthrough', {
    url: "/",
    templateUrl: "templates/walkthrough.html",
    controller: 'WalkthroughCtrl',
    data: {
      authenticate: false
    }
  })

  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'LoginCtrl',
    data: {
      authenticate: false
    }
  })

  .state('signup', {
    url: "/signup",
    templateUrl: "templates/signup.html",
    controller: 'SignupCtrl',
    data: {
      authenticate: false
    }
  })

  .state('forgot-password', {
    url: "/forgot-password",
    templateUrl: "templates/forgot-password.html",
    controller: 'ForgotPasswordCtrl',
    data: {
      authenticate: false
    }
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/side-menu.html",
    controller: 'AppCtrl'
  })


  .state('app.maps', {
    url: "/maps",
    views: {
      'menuContent': {
        templateUrl: "templates/maps.html",
        controller: 'MapsCtrl'
      }
    },
    data: {
      // authenticate: true
      authenticate: false
    }
  })

  .state('app.places', {
      url: "/places",
      views: {
          'menuContent': {
              templateUrl: "templates/places.html",
              controller: 'PlacesCtrl'
          }
      },
      data: {
          // authenticate: true
          authenticate: false
      }
  })

  .state('app.places-categories', {
    url: "/places-categories",
    views: {
      'menuContent': {
        templateUrl: "templates/places-categories.html",
        controller: 'PlacesCategoriesCtrl'
      }
    },
    data: {
      // authenticate: true
      authenticate: false
    }
  })



  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    },
    data: {
      // authenticate: true
      authenticate: false
    }
  })




  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
});
