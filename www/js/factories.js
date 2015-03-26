angular.module('your_app_name.factories', [])


.factory('placesFactory',  function ($http) {
    // Service logic
    // ...

    var url = 'http://vps129509.ovh.net/torinfony/api/v1/places';
    var format = '.json';
    var response = null;

    // Public API here
    return {
        getAll: function(){
            var urlId = url.concat(format);
            return $http.get(urlId);
        },
        get: function (id) {
            var urlId = url.concat('/').concat(id).concat(format);
            return $http.get(urlId);
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
        }
    };

})
.factory('categoriesFactory', function($http) {

    var url = 'http://vps129509.ovh.net/torinfony/api/v1/categories';
    var format = '.json';
    var response = null;
    var categoriesObj = {};



    // Public API here
    return {
        getAll: function(){
            var urlId = url.concat(format);
            return $http.get(urlId)

        },
        get: function (id) {
            var urlId = url.concat('/').concat(id).concat(format);
            return $http.get(urlId);
        }

    }

});
