function ZipCtrl($scope){
	var map;
	/* Basemap Layers */
	var mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");
	var sql = "SELECT ap, zip, FROM [zbp.zbp_totals] WHERE year=2012 AND SUBSTR(zip, 1, 2) in ('10','11', '12', '13','14') GROUP BY zip, ap, ORDER BY zip asc;";
	var ziplayer = {};
	var mapLoaded = false;
	map = L.map("map", {
	  center: [42.76314586689494,-74.7509765625],
	  zoom: 7,
	  layers: [mapquestOSM],
	  zoomControl: false
	});

	$scope.year = "1994";
	$scope.dataMode = 2; //2 is emp, 3 is ap, 4 is ap/emp.
	$scope.$watch("year", function(){
		console.log($scope.year);
		if(mapLoaded)
			ziplayer.transition();
	});
	$scope.play = function(){
		function myLoop(){
			setTimeout(function(){
				// 
				// 	//$scope.year++;
				if($scope.year < 2012){
					myLoop(); //  ..  again which will trigger another 
        			console.log('foo' + $scope.year);
        			$scope.year++;
        			$scope.year = $scope.year+'';
        			$scope.$apply();
        		}
			},3000)
		}
		myLoop();
	}
	$scope.mode = function(_dataMode){
		console.log("Changed mode!");
		$scope.dataMode=_dataMode;
		if(mapLoaded)
			ziplayer.transition(); //make better-open d3leaflet-layers.js.
	}
	d3.json('/zipData')
		.post(function(err,data){
			$scope.current_data = data;		
			console.log(data);

			var salaries = [];
			data.data.rows.map(function(zip){
				salaries.push(+zip.f[2].v)
			});
			console.log(salaries);
			//var payscale = d3.scale.linear().domain([ d3.min(salaries), d3.max(salaries) ]).range(['#fff' , '#000']);
			var payscale = d3.scale.quantile().domain(salaries).range(colorbrewer.RdBu[9].reverse())
			//var payscale = d3.scale.sqrt().range(colorbrewer.Spectral[9].reverse());

			d3.json('/geo/ny.json',function(err,zips){
  
		  		var options = {
		                layerId:'zipcodes',
		                classed:'zip',
		                choropleth:zipSalary
		                }; 
		  		ziplayer = new L.GeoJSON.d3(zips,options)
		  		map.addLayer(ziplayer);
		  		mapLoaded = true;

			});
			function zipSalary(d){
				//console.log(d.properties.geoid);
				//console.log('zipSalary');
				var data;
				var ti = 0;
				while(ti < $scope.current_data.data.rows.length){ //could binary search, but I'm lazy
					if($scope.current_data.data.rows[ti].f[1].v === d.properties.geoid.toString() && $scope.current_data.data.rows[ti].f[0].v === $scope.year){
						//console.log(($scope.current_data.data.rows[ti].f[0].v));
						if($scope.dataMode === 4)
							data = $scope.current_data.data.rows[ti].f[2].v/$scope.current_data.data.rows[ti].f[3].v;
						else
							data = $scope.current_data.data.rows[ti].f[$scope.dataMode].v;
						break;
					}
					ti++;
				}
				//if(Math.round((Math.log(data)/Math.log(2))*10).toString(16).toUpperCase() > 0)
					//return "#FFFFFF"
				//return "#" + (Math.round((Math.log(data)/Math.log(2))*10).toString(16).toUpperCase()).toString(16) + "0000";	
				return payscale(data);
				
			}
	});
	

	
}
