/*app.controller('zipmapctrl', */function ZipCtrl($scope){
	var map;
	/* Basemap Layers */
	var mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");
	var sql = "SELECT ap, zip, FROM [zbp.zbp_totals] WHERE year=2012 AND SUBSTR(zip, 1, 2) in ('10','11', '12', '13','14') GROUP BY zip, ap, ORDER BY zip asc;";

	map = L.map("map", {
	  center: [42.76314586689494,-74.7509765625],
	  zoom: 7,
	  layers: [mapquestOSM],
	  zoomControl: false
	});

	function zipSalary(d){
		console.log(d.properties.geoid);
		return '#0ff';
	}
	d3.json('/geo/ny.json',function(err,zips){
  
	  	var options = {
	                layerId:'zipcodes',
	                classed:'zip',
	                choropleth:zipSalary
	                }; 
	  	map.addLayer(new L.GeoJSON.d3(zips,options));

	});

	d3.json('/zipData')
		.post(function(err,data){
			$scope.current_data = data;		
			console.log(data);
			//d3.scale().linear().domain().range([#f00,#00f])
	})
}//);
