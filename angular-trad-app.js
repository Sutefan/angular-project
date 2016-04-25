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
    	templateUrl:'views/trad.html',
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
	tls.fetchTrad = function(){
		if(angular.isDefined(tls.traduits)&&angular.isDefined(tls.absents)){
			tls.loading = true;
			$http({method:'POST',url:'propositions.asp',data:$.param({traduits:tls.traduits,absents:tls.absents}),headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}
			}).success(function(data, status, headers, config){
			    if(!angular.equals(tls.manquants,data)){tls.manquants = data;}
			    tls.underline(-1);
			    tls.loading = false;
			}).error(function(data, status, headers, config){
			    alert(status);
			    tls.loading = false;
			});	
		}else{
			alert('Veuillez choisir une langue de base et une langue à traduire');
		}
	}
	tls.updateTrad = function(texte,traduction,index){
		tls.loading = true;
		if(angular.isDefined(traduction)){
			$http({method:'POST',url:'traduction.asp',data:$.param({texte:texte,traduction:traduction,traduit:tls.traduits,absent:tls.absents}),headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}
			}).success(function(data, status, headers, config){
				if(data==''){tls.manquants.splice(index,1);}
			    tls.loading = false;
			    tls.underline(-1);
			    dataService.getCounts().then(function(data){
			    	tls.counts = data;
			    });
			}).error(function(data, status, headers, config){
			    alert(status);
			    tls.loading = false;
			});	
		}else{
			alert('Traduction manquante');						
		}
	};
	tls.askGoogle = function(base,index){
		tls.underline(index);
		if(angular.isDefined(tls.popup)){tls.popup.close();}
		var cible = (tls.absents=='gb')?'en':tls.absents;
		tls.popup = window.open('//translate.google.fr/#'+tls.traduits+'/'+cible+'/'+encodeURI(base),"google_trad");
	};
	tls.askLinguee = function(base,index){
		tls.underline(index);
		if(angular.isDefined(tls.popup)){tls.popup.close();}
		var len = tls.langues.length, from, to;
		for(var i=0;i<len;i++){
			if(tls.langues[i].shortcut==tls.traduits){
				from = tls.langues[i].linguee;
			}else if(tls.langues[i].shortcut==tls.absents){
				to = tls.langues[i].linguee;
			}
		}
		tls.popup = window.open('//www.linguee.fr/'+from+'-'+to+'/search?query='+encodeURI(base),"linguee");
	};
	tls.underline = function(index){
		tls.selectedIndex = (tls.selectedIndex!=index)?index:-1;
	};
	tls.fetchPropositions = function(texte,propositions,index){
		tls.loading = true;
		$http({method:'POST',url:'correspondances.asp',data:$.param({texte:texte,traduits:tls.traduits,absent:tls.absents}),headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}
		}).success(function(data, status, headers, config){
		    tls.loading = false;
		    tls.manquants[index].propositions = data;
		}).error(function(data, status, headers, config){
		    alert(status);
		    tls.loading = false;
		});	
	};
	tls.setPropositionsToZero = function(index){
		tls.manquants[index].propositions = [];
	};
	tls.fetchPath = function(index){
		tls.loading = true;
		$http({method:'POST',url:'chemin.asp',data:$.param({traduits:tls.traduits,search:tls.manquants[index].traduits}),headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}
		}).success(function(data, status, headers, config){
		    tls.loading = false;
		    window.open('//www.'+data.url_site+'/advanced_search.asp?code0_ref='+data.code0_ref+'&search='+encodeURI(tls.manquants[index].traduits));
		}).error(function(data, status, headers, config){
		    alert(status);
		    tls.loading = false;
		});						
	};		
}]);