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
	var twoNaicsKey = {'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"};
	var fullNaicsKey = {};
	var sortedData = {1994 : {}, 1995: {}, 1996: {}, 1997: {}, 1998: {}, 1999: {}, 2000: {}, 2001: {}, 2002: {}, 2003: {}, 2004: {}, 2005: {}, 2006: {}, 2007: {}, 2008: {}, 2009: {}, 2010: {}, 2011: {}, 2012:{}};
	var scaleDomain, colorScale;
	var keys;
	var legend = d3.select("#legend")
		.append("ul")
		  .attr("class", "list-inline");
	$scope.year = "1994";
	$scope.dataMode = 2; //2 is emp, 3 is ap, 4 is ap/emp.
	$scope.$watch("year", function(){
		//console.log($scope.year);
		if(mapLoaded)
			ziplayer.transition();
	});

	var popup = d3.select("#info");

	var currentNaics = "------";
	var naicsData;
	/*
	Have two extra appearing legend parts in top left:
	first that appears when emp selected, allows user to choose first 2 numbers of NAICS and see the estimated totals for each industry on the map
	second appears once first selected, allows user to specify a NAICS based off the first two numbers
	*/
	var legendChange = function(){
		legend.html(function(){
			switch($scope.dataMode){
				case 2: return "<center><strong>Annual Payroll"; break;
				case 3: return "<center><strong>Annual Employees"; break;
				case 4: return "<center><strong>Annual Pay per Employee"; break;
				default: return "<center><strong>Legend";
			}
		});
		keys = legend.selectAll("li.key")
			.data(colorScale.range())

		keys.enter().append("li")
			.attr("class", "key")
			.style("border-top-color", String)
			.text(function(d) {
				var r = colorScale.invertExtent(d);
				return Math.round(r[0]);
		});
	}

	$scope.play = function(){
		function myLoop(){
			setTimeout(function(){
				// 
				// 	//$scope.year++;
				if($scope.year < 2012){
					myLoop(); //  ..  again which will trigger another 
        			//console.log('foo' + $scope.year);
        			$scope.year++;
        			$scope.year = $scope.year+'';
        			$scope.$apply();
        		}
			},3000)
		}
		myLoop();
	}
	$scope.mode = function(_dataMode){
		//console.log(_dataMode);
		switch(_dataMode){
			case "ap": $scope.dataMode = 2; break;
			case "emp": $scope.dataMode = 3; break;
			case "ap/emp": $scope.dataMode = 4; break;
		}
		scaleDomain = [];
		if(mapLoaded && $scope.dataMode == 4){
			$scope.current_data.data.rows.map(function(zip){
				scaleDomain.push(+zip.f[2].v/+zip.f[3].v);
			});
			 
		}
		else if(mapLoaded){
			$scope.current_data.data.rows.map(function(zip){
				scaleDomain.push(+zip.f[$scope.dataMode].v)
			});
		}
		//console.log(scaleDomain);
		colorScale = d3.scale.quantile().domain(scaleDomain).range(colors);
		legendChange();
		ziplayer.transition();
	}

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
					//console.log($scope.current_data.data.rows[i].f[3].v);
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
		//console.log(name, " ", data);
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
	function sortData() {
		var ti = 0;
		var dd = [];
		dd = $scope.current_data.data.rows;
		while(ti < dd.length){ 
			var y = +dd[ti].f[0].v;//year
			var z = dd[ti].f[1].v.toString(); //zip
			var d = dd[ti].f; //the array of data
			sortedData[y][z] = d; //each final data thingy is an array of v objs.
			ti++;
		}
	}

	function showNaics(d){
		naics.style("display", "block");
		d3.json('/zipNaics') // param 2dNaics
		.post(function(err,data){
			fullNaicsKey = data;
			console.log(fullNaicsKey);
		})
		d3.json('/zipNaicsData')
			.post(JSON.stringify({naics:currentNaics,year:$scope.year}), function(error, data){
				naicsData = data;
				console.log(data);
			})				
	}

	function hideNaics(){
		naics.style("display", "none");
	}

	d3.json('/zipData')
		.post(function(err,data){
			$scope.current_data = data;		
			//console.log(data);
			scaleDomain = [];
			data.data.rows.map(function(zip){
				scaleDomain.push(+zip.f[$scope.dataMode].v)
			});
			sortData();	
			//var sortedData = {'year':{'12203':[], '12204':[]},'1995':{'12203':[],'12223',}}
			//sortedData[1995]['12203'] = []

			colorScale = d3.scale.quantile().domain(scaleDomain).range(colors);
			
			legend.html(function(){
				switch($scope.dataMode){
					case 2: return "<center><strong>Annual Payroll"; break;
					case 3: return "<center><strong><center><strong>Annual Employees"; break;
					case 4: return "<center><strong>Annual Pay per Employee"; break;
					default: return "<center><strong>Legend";
				}
			});
			keys = legend.selectAll("li.key")
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
				if(sortedData[$scope.year][d.properties.geoid])
					return colorScale($scope.dataMode === 4 ? sortedData[$scope.year][d.properties.geoid][2].v/sortedData[$scope.year][d.properties.geoid][3].v : data = sortedData[$scope.year][d.properties.geoid][$scope.dataMode].v);				
				else return "#000";
			}
	});
	

	
}