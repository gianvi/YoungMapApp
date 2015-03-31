angular.module('your_app_name.controllers', ['ngTagsInput'])

// APP
.controller('AppCtrl', function($scope) {

})

// WALKTHROUGH
.controller('WalkthroughCtrl', function($scope, $state) {
	$scope.goToLogIn = function(){
		$state.go('login');
	};

	$scope.goToSignUp = function(){
		$state.go('signup');
	};
})

.controller('LoginCtrl', function($scope, $state, $templateCache, $q, $rootScope) {
	$scope.goToSignUp = function(){
		$state.go('signup');
	};

	$scope.goToForgotPassword = function(){
		$state.go('forgot-password');
	};

	$scope.doLogIn = function(){
		$state.go('app.maps');
	};

	$scope.user = {};

	$scope.user.email = "ginvito.siciliano@gmail.com";
	$scope.user.pin = "12345";

	// We need this for the form validation
	$scope.selected_tab = "";

	$scope.$on('my-tabs-changed', function (event, data) {
		$scope.selected_tab = data.title;
	});

})

.controller('SignupCtrl', function($scope, $state) {
	$scope.user = {};

	$scope.user.email = "gianvito.siciliano@gmail.com";

	$scope.doSignUp = function(){
		$state.go('app.maps');
	};

	$scope.goToLogIn = function(){
		$state.go('login');
	};
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
	$scope.recoverPassword = function(){
		$state.go('app.maps');
	};

	$scope.goToLogIn = function(){
		$state.go('login');
	};

	$scope.goToSignUp = function(){
		$state.go('signup');
	};

	$scope.user = {};
})



.controller('SendMailCtrl', function($scope) {
	$scope.sendMail = function(){
		cordova.plugins.email.isAvailable(
			function (isAvailable) {
				// alert('Service is not available') unless isAvailable;
				cordova.plugins.email.open({
					to:      'envato@startapplabs.com',
					cc:      'hello@startapplabs.com',
					// bcc:     ['john@doe.com', 'jane@doe.com'],
					subject: 'Greetings',
					body:    'How are you? Nice greetings from IonFullApp'
				});
			}
		);
	}
})

.controller('PlaceEntriesCtrl', function($scope, $stateParams, placesFactory, $q, $ionicLoading) {

    $scope.placeId = $stateParams.placeId;
    
    var placeId = $stateParams.placeId;


        placesFactory.get(placeId)
        .success(function(place){
            console.log("getPlaceEntries success: ");
            $scope.place = angular.fromJson(place);
            console.log($scope.place);
        })
        .error(function(error){
            console.log("getPlaceEntries error");
            console.log(error);
        });

    $scope.readMore = function(link){
        window.open(link, '_blank', 'location=yes');
    }
})


.controller('MapsCtrl', function($scope, $state, $stateParams, $ionicViewService, $ionicLoading, $ionicModal, leafletData, leafletEvents, placesFactory, categoriesFactory) {

    $scope.eventDetected = "No events yet...";
    var mapEvents = leafletEvents.getAvailableMapEvents();
    for (var k in mapEvents){
        var eventName = 'leafletDirectiveMap.' + mapEvents[k];
        $scope.$on(eventName, function(event){
            $scope.eventDetected = event.name;
        });
    }

    console.log($stateParams);
    var center = parseInt($stateParams.centerPosition);

    /*
         * Create default map and load marker from API
         */

    $scope.$on("$stateChangeSuccess", function() {

        //$ionicViewService.clearHistory();
        if(!$scope.map){
            console.log("no SCOPEmap!");

            $scope.my_location = "";
            

            $scope.info_position = {
                lat: 45.065943,
                lng: 7.643738
            };


            $scope.map = {
                defaults : {
                    tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                    maxZoom: 18,
                    zoomControlPosition: 'bottomleft'
                },
                markers : {},
                center : {},
                controls: {},
                events : {
                    map: {
                        enable: ['context'],
                        logic: 'emit'
                    }
                }
            }

            $scope.setControls();

            
            if(!isNaN(center)){
                $scope.loadMarker(center);
                //$scope.locate(center);
            }
            else{
                $scope.loadMarkers();
                $scope.locate($scope.info_position);
            }
            $scope.loadCategories();

        }

    });

    $scope.setControls = function(){
        leafletData.getMap('mymap').then(function(map) {
            map.addControl( new L.Control.Search({
                    url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                    jsonpParam: 'json_callback',
                    propertyName: 'display_name',
                    propertyLoc: ['lat','lon'],
                    circleLocation: false,
                    markerLocation: true,
                    markerClass: L.marker,
                    autoType: false,
                    autoCollapse: true,
                    minLength: 2,
                    zoom:12
                })
            );
            map.addControl(new L.control.locate({
                    zoom: 12,
                    metric: true,
                    keepCurrentZoomLevel: true,
                    markerClass:L.marker,
                    showPopup: true,
                    strings: {
                        title: "Show me where I am",
                        popup: "You are within {distance} {unit} from this point",
                        outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
                    },
                })
            );
        });

    }

    $scope.loadCategories = function(){
        categoriesFactory.getAll()
        .success(function(cat){
            console.log("getCat success: ");
            //console.log(cat[0]);
            $scope.categories = angular.fromJson(cat);
        })
        .error(function(error){
            console.log("getCat error");
            console.log(error);
        });
    }

    /**
     *  Save place in locations from APIfactory
     */
    $scope.loadMarkers = function(){

        $scope.locations = new Array();

        leafletData.getMap().then(function(map){
            var bounds = map.getBounds();

            var bbox = {
                ne_lat: bounds.getNorthEast().lat,
                ne_lng: bounds.getNorthEast().lng,
                sw_lng: bounds.getSouthWest().lng,
                sw_lat: bounds.getSouthWest().lat   
            }

            placesFactory.getBBox(bbox)
            .then(function(data){
                console.log("getBBox success");
                console.log(data);
                for(var el in data)
                    if(data[el].geometries[0].coordinates.length)
                        $scope.locations.push(angular.fromJson(data[el]));
                $scope.saveMarkers();
            });
        });
    };

    /**
     *  Save markers loaded in locations
     */
    $scope.saveMarkers = function(){
        for(i=0; i<$scope.locations.length; i++)
            $scope.map.markers[parseInt($scope.locations[i].id_wp)] = {
                lat: parseInt($scope.locations[i].geometries[0].coordinates[1]),
                lng: parseInt($scope.locations[i].geometries[0].coordinates[0]),
                message: $scope.locations[i].name,
                focus: false,
                draggable: false
            };
    }


    
    /**
     *  Save place in locations from APIfactory
     */
    $scope.loadMarker = function(placeId){

        $scope.locations = new Array();

        placesFactory.get(placeId)
        .success(function(place){
            console.log("getPlaceEntries success: ");
            $scope.locations.push(angular.fromJson(place));
            $scope.map.markers[placeId] = {
                    lat:place.geometries.coordinates[1],
                    lng:place.geometries.coordinates[0],
                    message: "From menu",
                    focus: true,
                    draggable: false
            };
        })
        .error(function(error){
            console.log("getPlaceEntries error");
            console.log(error);
        });

    };

    /**
      * Center map on user's current position
      */
    $scope.locate = function(coord){
        $ionicLoading.show({
            template: 'Locating...'
        });

        //center on specific saved location by key (from menu)
        if(typeof(coord) === 'number'){

            var location = $scope.map.markers[coord];
                console.log(location);
            $scope.map.center  = {
                lat : parseFloat(location.geometries[0].coordinates[0]),
                lng : parseFloat(location.geometries[0].coordinates[1]),
                zoom : 15
            }
        }

        //center on user current position (from button)
        else if(coord === null){
            navigator.geolocation.getCurrentPosition(function(position) {

                $scope.map.center.lat = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                $scope.map.zoom = 15;

                $scope.map.markers.now = {
                    lat:position.coords.latitude,
                    lng:position.coords.longitude,
                    message: "You Are Here",
                    focus: true,
                    draggable: false
                };

            });
        }


        //center on coord (initialized in turin)
        else {
            $scope.map.center.lat = coord.lat;
            $scope.map.center.lng = coord.lng;
            $scope.map.center.zoom = 11;
        }

        $ionicLoading.hide();

    };


    /*
       * Detect user long-pressing on map to add new location
       */
    $scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent){
        $scope.map.markers.now={
            lat: locationEvent.leafletEvent.latlng.lat,
            lng: locationEvent.leafletEvent.latlng.lng,
            message: "<div><a class='item item-icon-right' href='#/app/place-entry'>Drag & Complete Wizard</a></div>",
            focus: true,
            draggable: true
        };

    });
    
    
    $scope.$on('leafletDirectiveMarker.dragend', function(event, markerEvent){
        $scope.wizard.dataForm = {
            type: 1,
            geometries: [
                {
                    type: "Point",
                    coordinates: [
                        markerEvent.leafletEvent.target._latlng.lat,
                        markerEvent.leafletEvent.target._latlng.lng
                    ]
                }
            ],
            tags: [
                { text: 'first' },
                { text: 'life' }
            ],
            categories: [],
            name: null,
            description: null,
            link_url: null
        };
        $scope.openModal();
    });
        



    $ionicModal.fromTemplateUrl('templates/form/wizard.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal){
        console.log("modal success");
        $scope.modal = modal;
    });


    $scope.openModal = function() {
        $scope.modal.show()
    }

    $scope.closeModal = function() {
        $scope.map.markers.now = null;
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.wizard = {};
    $scope.wizard.steps = ['one', 'two', 'three'];
    $scope.wizard.step = 0;
    $scope.wizard.dataForm = {};
    $scope.wizard.isFirstStep = function () {
        return $scope.wizard.step === 0;
    };

    $scope.wizard.isLastStep = function () {
        return $scope.wizard.step === ($scope.wizard.steps.length - 1);
    };

    $scope.wizard.isCurrentStep = function (step) {
        return $scope.wizard.step === step;
    };

    $scope.wizard.setCurrentStep = function (step) {
        $scope.wizard.step = step;
    };

    $scope.wizard.getCurrentStep = function () {
        return $scope.wizard.steps[$scope.wizard.step];
    };

    $scope.wizard.getNextLabel = function () {
        return ($scope.wizard.isLastStep()) ? 'Submit' : 'Next';
    };

    $scope.wizard.handlePrevious = function () {
        $scope.wizard.step -= ($scope.wizard.isFirstStep()) ? 0 : 1;
    };

    $scope.wizard.handleNext = function () {
        if ($scope.wizard.isLastStep()) {
            $scope.processData($scope.wizard.dataForm);
        } else {
            $scope.wizard.step += 1;
        }
    };

    $scope.wizard.dismiss = function(reason) {
        console.log("wizard dismiss");;
    };



    // function to process the form
    $scope.processData = function(data) {
        for(el in data.tags){
            data.tags[el] = data.tags[el].text;
        }
        console.log(data);
        console.log("processData");
        placesFactory.create(data);
    };






    /**
     *  Detect user bounding box changing
     */
    $scope.$on('leafletDirectiveMap.moveend', function(event, args){
        //$scope.newBbox = new BBox();
        leafletData.getMap().then(function(map){

            var bounds = map.getBounds();
            //alert('northwest=' + bounds.getNorthWest().toString() + '\n&northeast=' + bounds.getNorthEast().toString() + '\n&southeast=' +                    bounds.getSouthEast().toString() + '\n&southwest=' + bounds.getSouthWest().toString());
        });

    });


})


// CATEGORIES
//brings all place categories
.controller('PlacesCategoriesCtrl', function($scope, categoriesFactory) {
	$scope.categories = [];

    categoriesFactory.getAll()
        .success(function(cat){
            console.log("getCat success: ");
            $scope.categories = angular.fromJson(cat);
            //console.log($scope.categories[0]);
        })
        .error(function(error){
            console.log("getCat error");
            console.log(error);
        });

})

// PLACES
.controller('PlacesCtrl', function($scope, $state, placesFactory) {
    $scope.locations = [];

    //tutti i places (mentre in map carica solo da BBox)
    placesFactory.getAll()
    .success(function(loc){
        console.log("getLoc success: ");
        for(var el in loc)
            if(loc[el].geometries[0].coordinates.length)
                $scope.locations.push(angular.fromJson(loc[el]));
        //console.log($scope.locations[0]);
    })
    .error(function(error){
        console.log("getLoc error");
        console.log(error);
    });
    
    $scope.goTo = function(placeIndex){
        //center on specific saved location by key (from menu)
        //if(typeof(coord) === 'number'){
            //console.log("COORD DA CENTRARE"+coord);
            //$state.go('app.maps', {centerPosition: placeIndex});
        //}
    }


})



// SETTINGS
.controller('SettingsCtrl', function($scope, $ionicActionSheet, $state) {
	$scope.airplaneMode = true;
	$scope.wifi = false;
	$scope.bluetooth = true;
	$scope.personalHotspot = true;

	$scope.checkOpt1 = true;
	$scope.checkOpt2 = true;
	$scope.checkOpt3 = false;

	$scope.radioChoice = 'B';

	// Triggered on a the logOut button click
	$scope.showLogOutMenu = function() {

		// Show the action sheet
		var hideSheet = $ionicActionSheet.show({
			//Here you can add some more buttons
			// buttons: [
			// { text: '<b>Share</b> This' },
			// { text: 'Move' }
			// ],
			destructiveText: 'Logout',
			titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
			cancelText: 'Cancel',
			cancel: function() {
				// add cancel code..
			},
			buttonClicked: function(index) {
				//Called when one of the non-destructive buttons is clicked,
				//with the index of the button that was clicked and the button object.
				//Return true to close the action sheet, or false to keep it opened.
				return true;
			},
			destructiveButtonClicked: function(){
				//Called when the destructive button is clicked.
				//Return true to close the action sheet, or false to keep it opened.
				$state.go('login');
			}
		});

	};
});
