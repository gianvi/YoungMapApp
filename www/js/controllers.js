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
    var placeId = $stateParams.placeId
    $scope.place = null;
    
    //$scope.$on("$viewContentLoading", function(){
        $scope.placeId = $stateParams.placeId;

        placesFactory.get(placeId)
        .then(
            function(place){
                console.log("getPlaceEntries success: ");
                $scope.place = angular.fromJson(place);
                console.log($scope.place.message);
            },
            function(error){
                console.log("getPlaceEntries error");
                console.log(error);
            });
    //}); 
    
    
    




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
    $scope.events = {
        markers: {
            enable: leafletEvents.getAvailableMarkerEvents(),
        }
    };
    var markerEvents = leafletEvents.getAvailableMarkerEvents();
    for (var k in markerEvents){
        var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
        $scope.$on(eventName, function(event, args){
            $scope.eventDetected = event.name;
        });
    }
    
    
    console.log("MapStateParam: ", $stateParams);
    var center = parseInt($stateParams.centerPosition);

    /*
     * Create default map with markers and categories loaded from API
     */
    $scope.$on("$stateChangeSuccess", function() {

        //$ionicViewService.clearHistory();
        if(!$scope.map){
            $scope.my_location = "";

            $scope.info_position = {
                lat: 45.071025,
                lng: 7.699056
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
            $scope.setBaseLayers();

            //se cè un marker-center dal menu places
            //caricalo e centra, setta il suo layer unico visibile e poi fai la bbox
            if(!isNaN(center)){
                $scope.loadMarker(center);
                $scope.updateCategories(center.category);
                $scope.updateMarkers();
            }
            
            //se è un caricamento mappa normale
            //centra su torino, setta tutti i layer visibili e poi fai la bbox 
            else{
                $scope.locate($scope.info_position);
                $scope.updateCategories();
                $scope.updateMarkers();

            }
        }

    });

    $scope.setBaseLayers = function() {
        $scope.map.layers = {
            baselayers: {
                openStreetMap: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                },
                toner: {
                    name: 'Toner',
                    type: 'xyz',
                    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
                },
                watercolor: {
                    name: 'Watercolor',
                    type: 'xyz',
                    url: 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg'
                }
            },
            overlays: {}
        }
    };

    $scope.setCategoriesOverlays = function(){
        for(el in $scope.categories)
            $scope.map.layers.overlays[$scope.categories[el].id] = {
                name: $scope.categories[el].name,
                type: "markercluster",
                visible: true 
            }
    };


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
    };
    
    
    $scope.updateMarkers = function() {
        leafletData.getMap().then(function(map){
            var bounds = map.getBounds();

            var bbox = {
                ne_lat: bounds.getNorthEast().lat,
                ne_lng: bounds.getNorthEast().lng,
                sw_lng: bounds.getSouthWest().lng,
                sw_lat: bounds.getSouthWest().lat,
                limit: 3
            }

            placesFactory.getBBox(bbox)
            .then(
            function(markers) {
                $scope.map.markers = markers;
            },
            function(error) {
                console.log("Failed to get all markers, result is " + error); 
            });
        });
    };
    
    $scope.updateCategories = function() {
        categoriesFactory.getAll()
        .then(
            /* success function */
            function(categories) {
                $scope.categories = categories;
                $scope.setCategoriesOverlays();
            },
            /* error function */
            function(error) {
                console.log("Failed to get all categories, result is " + error); 
            });
    };



    
    /**
     *  From place menu
     */
    $scope.loadMarker = function(placeId){
        placesFactory.get(placeId)
        .then(
            /* success function */
            function(marker) {
                $scope.map.markers[placeId] = marker;
            },
            /* error function */
            function(error) {
                console.log("Failed to get required marker, result is " + error); 
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
            $scope.map.center.zoom = 16;
        }

        $ionicLoading.hide();

    };

    
    //Click event handler
    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
        var temp_marker = $scope.map.markers[args.markerName];
        console.log('Marker clicked: ', temp_marker);
        //$state.go('app.forms');
    }); 

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
    
    /**
     *  Detect user bounding box changing
     */
    $scope.$on('leafletDirectiveMap.moveend', function(event, args){
        leafletData.getMap().then(function(map){
            var bounds = map.getBounds();         
        });
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
                {"text":"First"},
                {"text":"Life"}
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
        console.log("wizard dismiss");
    };

    // function to process the form
    $scope.processData = function(data) {
        console.log(data);
        for(el in data.tags){
            data.tags[el] = data.tags[el].text;
        }
        console.log(data);
        console.log("processData");
        placesFactory.create(data);
    };


})


// CATEGORIES
//brings all place categories
.controller('PlacesCategoriesCtrl', function($scope, categoriesFactory) {
	$scope.categories = [];

    categoriesFactory.getAll()
        .then(
        function(cat){
            console.log("getCat success: ");
            $scope.categories = angular.fromJson(cat);
            //console.log($scope.categories[0]);
        },
        function(error){
            console.log("getCat error");
            console.log(error);
        });

})

// PLACES
.controller('PlacesCtrl', function($scope, $state, placesFactory) {
    $scope.locations = [];

    //tutti i places (mentre in map carica solo da BBox)
    placesFactory.getAll()
    .then(
        function(loc){
            console.log("getLoc success: ");
            for(var el in loc)
                if(loc[el].geometries[0].coordinates.length)
                    $scope.locations.push(angular.fromJson(loc[el]));
        },
        function(error){
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
