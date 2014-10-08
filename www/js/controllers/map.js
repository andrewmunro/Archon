archon.controller('MapCtrl', function ($scope, $ionicLoading, $compile) {

	var nuiaTypeOptions = {
		getTileUrl: function(coord, zoom) {
			var normalizedCoord = getNormalizedCoord(coord, zoom);
			if (!normalizedCoord) {
				return null;
			}

			var bound = Math.pow(2, zoom);

			return '/img/maps/world' +
			'/' + zoom + '/' + normalizedCoord.x + '/' +
			(bound - normalizedCoord.y - 1) + '.jpg';
		},

		tileSize: new google.maps.Size(256, 256),
		maxZoom: 7,
		minZoom: 1,
		name: 'Nuia'
	};

	var nuiaMapType = new google.maps.ImageMapType(nuiaTypeOptions);

	function initialize() {
		var myLatlng = new google.maps.LatLng(0,0);

		var mapOptions = {
			center: myLatlng,
			zoom: 4,
			streetViewControl: false,
			mapTypeControlOptions: {
				mapTypeIds: ['nuia']
			}
		};

		var map = new google.maps.Map(document.getElementById("map"),
		    mapOptions);

		map.mapTypes.set('nuia', nuiaMapType);
		map.setMapTypeId('nuia');

		//Marker + infowindow + angularjs compiled ng-click
		var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
		var compiled = $compile(contentString)($scope);

		var infowindow = new google.maps.InfoWindow({
			content: compiled[0]
		});

		var marker = new google.maps.Marker({
			position: myLatlng,
			map: map,
			title: 'Some Place'
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.open(map,marker);
		});

		google.maps.event.addListener(map, "mousemove", function(event) {
			var lat = event.latLng.lat();
			var lng = event.latLng.lng();
			$scope.coordiantes = "Lat=" + lat + "; Lng=" + lng;
			$scope.$apply();
		});

		$scope.map = map;
	}

	// Normalizes the coords that tiles repeat across the x axis (horizontally)
	// like the standard Google map tiles.
	function getNormalizedCoord(coord, zoom) {
		var y = coord.y;
		var x = coord.x;

		// tile range in one direction range is dependent on zoom level
		// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
		var tileRange = 1 << zoom;

		// don't repeat across y-axis (vertically)
		if (y < 0 || y >= tileRange) {
			return null;
		}

		// repeat across x-axis
		if (x < 0 || x >= tileRange) {
			x = (x % tileRange + tileRange) % tileRange;
		}

		return {
			x: x,
			y: y
		};
	}

	$scope.clickTest = function() {
		alert('Example of infowindow with ng-click')
	};

	initialize();
});