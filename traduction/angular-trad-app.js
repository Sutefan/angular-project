angular.module('translations', ['ngAnimate','ngRoute'])
.factory('dataService', function($http){
	var getCounts = function(){
		return $http.get('compteurs.asp');
	};
	var langues = [{name:'Espagnol',linguee:'espagnol',shortcut:'es'},{name:'Anglais',linguee:'anglais',shortcut:'gb'},{name:'Néerlandais',linguee:'neerlandais',shortcut:'nl'},{name:'Français',linguee:'francais',shortcut:'fr'}];
	return {
	    getCounts:getCounts,
	    langues:langues
	}
})
.config(function($routeProvider,$locationProvider){
	$locationProvider.html5Mode({
	  enabled: true,
	  requireBase: true
	});
    $routeProvider.when('/index.html',{
    	templateUrl:'traduction/trad.html',
    	controller:'toolsController',
    	controllerAs:'tls',
    	resolve:{
    		counts:function(dataService){
    			return dataService.getCounts().then(function(r){
    				return r.data;
    			});
    		},
    		langues:function(dataService){
    			return dataService.langues;
    		}
    	}		 
    }).otherwise({
    	redirectTo:'/index.html'
  	});
})
.controller('toolsController',['$scope','$http','dataService','counts','langues', function($scope,$http,dataService,counts,langues){
	var tls = this;
	tls.langues = langues;
	tls.counts = counts;
	tls.origin = window.location.origin;
	tls.loading = false;
	tls.selectedIndex;
}]);