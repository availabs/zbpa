function ZipCtrl($scope){
	var map;
	var colors = colorbrewer.RdBu[9].reverse();
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
	var scaleDomain, colorScale;

	$scope.year = "1994";
	$scope.dataMode = 2; //2 is emp, 3 is ap, 4 is ap/emp.
	$scope.$watch("year", function(){
		//console.log($scope.year);
		if(mapLoaded)
			ziplayer.transition();
	});
	var popup = d3.select("#info");
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
		console.log(_dataMode);
		switch(_dataMode){
			case "ap": $scope.dataMode = 2; break;
			case "emp": $scope.dataMode = 3; break;
			case "ap_emp": $scope.dataMode = 4; break;
		}
		if(mapLoaded && $scope.dataMode == 4){
			scaleDomain = [];
			$scope.current_data.data.rows.map(function(zip){
				scaleDomain.push(parseInt(zip.f[2].v, 10) / parseInt(zip.f[3], 10)) // ISSUE: only pushing the emp data
			});
			console.log(scaleDomain);
			colorScale = d3.scale.quantile().domain(scaleDomain).range(colors);
			ziplayer.transition(); 
		}
		else if(mapLoaded){
			scaleDomain = [];
			$scope.current_data.data.rows.map(function(zip){
				scaleDomain.push(+zip.f[$scope.dataMode].v)
			});
			console.log(scaleDomain);
			colorScale = d3.scale.quantile().domain(scaleDomain).range(colors);
			ziplayer.transition(); 
		}
	}

	//TODO: legend w/ quantiles.
	function showPopup(d) {
		popup.style("display", "block");
		var i = 0,
			data,
			name;
		function normCityName(str){
			var ct1 = 1;
			var toRet = str.substring(0);
			while(str.substring(ct1) !== ","){
				while(str.substring(ct1) !== " "){
					toRet += str.substring(ct1).toLowerCase();
					ct1++;
				}
				ct1++;
			}
			toRet += str.substring(ct1, toRet.length);
			return toRet;
		}
		while(i < $scope.current_data.data.rows.length){
			if($scope.current_data.data.rows[i].f[1].v === d.properties.geoid.toString() && $scope.current_data.data.rows[i].f[0].v === $scope.year){
				//console.log(($scope.current_data.data.rows[ti].f[0].v));
				if($scope.dataMode === 4){
					data = $scope.current_data.data.rows[i].f[2].v/$scope.current_data.data.rows[i].f[3].v;
				}
				else
					data = $scope.current_data.data.rows[i].f[$scope.dataMode].v;
				
				if($scope.year > 1996)
					name = normCityName($scope.current_data.data.rows[i].f[4].v);
				else{
					name = $scope.current_data.data.rows[i].f[4].v;
				}
				break;
			}
			i++;
		}
		console.log(name, " ", data);
		popup.html($scope.year + "<br>" + name + "<br>" + data);
	}

	function movePopup() {
		var x = d3.event.x,
			y = d3.event.y;

		var el = popup.node(),
			wdth = el.offsetWidth,
			hght = el.offsetHeight;

		var width = window.innerWidth,
			height = window.innerHeight;

		var position = {
			right: 'auto',
			left: 'auto',
			top: 'auto',
			bottom: 'auto'
		}

		if (x + wdth > width) {
			position.left = (x-wdth-10)+'px';
		}
		else {
			position.left = (x+10)+'px';
		}

		if (y + hght > height) {
			position.top = (y-hght-10)+'px';
		}
		else {
			position.top = (y+10)+'px';
		}

		popup.style(position)
	}

	function hidePopup() {
		popup.style('display', 'none')
	}
	d3.json('/zipData')
		.post(function(err,data){
			$scope.current_data = data;		
			//console.log(data);
			scaleDomain = [];
			data.data.rows.map(function(zip){
				scaleDomain.push(+zip.f[$scope.dataMode].v)
			});
			
			colorScale = d3.scale.quantile().domain(scaleDomain).range(colors);
			//todo: updating the scale
			var legend = d3.select("#legend")
				.append("ul")
				  .attr("class", "list-inline");
			legend.html(function(){
				switch($scope.dataMode){
					case 2: return "<center><strong>Annual Payroll"; break;
					case 3: return "<center><strong><center><strong>Annual Employees"; break;
					case 4: return "<center><strong>Annual Pay per Employee"; break;
					default: return "<center><strong>Legend";
				}
			});
			var keys = legend.selectAll("li.key")
				.data(colorScale.range());

			keys.enter().append("li")
				.attr("class", "key")
				.style("border-top-color", String)
				.text(function(d) {
					var r = colorScale.invertExtent(d);
					return Math.round(r[0]);
				});
			//http://eyeseast.github.io/visible-data/2013/08/27/responsive-legends-with-d3/
			d3.json('/geo/ny.json',function(err,zips){
  
		  		var options = {
		                layerId:'zipcodes',
		                classed:'zip',
		                choropleth:zipSalary,
		                mouseoverFunction:showPopup,
		                mouseoutFunction:hidePopup,
		                mousemoveFunction:movePopup
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
				return colorScale(data);
				
			}
	});
	

	
}
