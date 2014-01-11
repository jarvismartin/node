'use strict';



/* Controllers */

var venfu = angular.module('venfu', []);

venfu.controller('productCtrl', function($scope, req) {
  $scope.products = [req.products];
    


});

// venfu.controller('productCtrl', function($scope) {
//   $scope.products = [
//     {'name': 'Nexus S',
//     'snippet': 'Fast just got faster with Nexus S.'},
//     {'name': 'Motorola XOOM™ with Wi-Fi',
//     'snippet': 'The Next, Next Generation tablet.'},
//     {'name': 'MOTOROLA XOOM™',
//     'snippet': 'The Next, Next Generation tablet.'}
//   ];
// });

// function productCtrl($scope, $http){
//     $http.get("/articles").success(function(articles, status, headers, config) {
//           $scope.articles = articles
//     });
// }