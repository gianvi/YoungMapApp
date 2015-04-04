angular.module('your_app_name.factories', [])


.factory('placesFactory',  function ($http, $q) {
    // Service logic
    var url = 'http://vps129509.ovh.net/torinfony/api/v1/places';
    var format = '.json';
    var response = null;
    var self = this;
    self.placeList = [];
    self.markerList = [];
    self.timestamp = null;

    var markerArray = [];
    var filteredArray = [];


    // Public API here
    return {
        
        //Called form PlacesView: return places (index from 0)
        getAll: function(){
            var deferred = $q.defer();
            var urlId = url.concat(format);

            if(self.placeList.length > 1) {
                deferred.resolve(self.placeList);
                console.log("Places cached service!");
            } 
            else {
                $http.get(urlId)
                .success(function(response) {
                    self.placeList = response;
                    //placesToMarker();
                    deferred.resolve(self.placeList);
                })
                .error(function(response) {
                    deferred.reject(response);
                });
            }

            //Now return the promise.
            return deferred.promise;            
        },
        get: function (id) {
            var deferred = $q.defer();
            var urlId = url.concat('/').concat(id).concat(format);
            
            if(self.markerList[id]){
                deferred.resolve(self.markerList[id]);
                console.log("Marker from cache!");
            }
            else{
                console.log("Marker from server...");
                $http.get(urlId)
                .success(function(response) {
                    self.placeList.push(response);
                    placeToMarker(id);
                    deferred.resolve(self.markerList[id]);
                })
                .error(function(response) {
                    deferred.reject(response);
                });
            }
            return deferred.promise;
        },
        update: function (id) {
            var urlId = url.concat(id).concat(format);
            return $http.put(urlId);
        },
        create: function (place) {
            var urlId = url.concat(format);
            return $http.post(urlId, place).then(function(response) {
                place.id = response.data.id;
                console.log(response);
                return place;
            });
        },
        getBBox: function(bbox){
            var deferred = $q.defer();
            var urlId = url.concat(format);

            if(self.markerList.length > 1) {
                deferred.resolve(self.markerList);
                console.log("Markers cached service!");
            } 
            /*return $http.get(urlId, bbox).then(function(response){
                return response.data;
            })*/
            else {
                $http.get(urlId, bbox)
                .success(function(response) {
                    self.placeList = response;
                    placesToMarker();
                    deferred.resolve(self.markerList);
                })
                .error(function(response) {
                    deferred.reject(response);
                });
            }

            //Now return the promise.
            return deferred.promise;            
        }

    };
    
    //private function
    function placesToMarker(){
        for(i=0; i<self.placeList.length; i++){
            self.markerList[parseInt(self.placeList[i].id_wp)] = {
                lat: parseFloat(self.placeList[i].geometries[0].coordinates[1]),
                lng: parseFloat(self.placeList[i].geometries[0].coordinates[0]),
                message: self.placeList[i].name,
                focus: false,
                draggable: false,
                category: parseInt(self.placeList[i].categories[0]),
                layer: (self.placeList[i].categories[0]).toString()
            };
        }
    }
    
    //private function
    function placeToMarker(id){
        var i = self.placeList.length-1;
            self.markerList[parseInt(self.placeList[i].id_wp)] = {
                lat: parseFloat(self.placeList[i].geometries[0].coordinates[1]),
                lng: parseFloat(self.placeList[i].geometries[0].coordinates[0]),
                message: self.placeList[i].name,
                focus: true,
                draggable: false,
                category: parseInt(self.placeList[i].categories[0]),
                layer: (self.placeList[i].categories[0]).toString()
            };
        
    }

})
.factory('categoriesFactory', function($http, $q) {

    var url = 'http://vps129509.ovh.net/torinfony/api/v1/categories';
    var format = '.json';
    var categories = [];


    // Public API here
    return {
        getAll: function(){
            var deferred = $q.defer();
            var urlId = url.concat(format);

            //cache
            if(categories.length > 1) {
                deferred.resolve(categories);
                console.log("Categories cached service!");
            } 
            //server call
            else {
                $http.get(urlId)
                .success(function(response) {
                    categories = response;
                    deferred.resolve(categories);
                })
                .error(function(response) {
                    deferred.reject(response);
                });
            }

            //Now return the promise.
            return deferred.promise;            
        },
        get: function (id) {
            var urlId = url.concat('/').concat(id).concat(format);
            return $http.get(urlId);
        }

    }

});
