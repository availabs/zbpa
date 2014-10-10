function ZipCtrl($scope){
	var map;
	
	/* Basemap Layers */
	var mapquestOSM = L.tileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");

	map = L.map("map", {
	  center: [42.76314586689494,-74.7509765625],
	  zoom: 7,
	  layers: [mapquestOSM],
	  zoomControl: false
	});
}