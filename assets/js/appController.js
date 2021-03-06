app.controller('AppCtrl', function MapCtrl($scope, $modal, $log, $http,$sce){
	
	//var apiUrl = 'http://localhost:1337/';///'http://api.availabs.org/gtfs/';
	//console.log('App Ctrl')
	$scope.urbanAreas = {};
	urbanGeo = topojson.feature(urbanAreas, urbanAreas.objects['ny_urban_areas']);
	urbanGeo.features.forEach(function(d){
		$scope.urbanAreas[d.properties.geoid] = d.properties;
	})
 $scope.naics2 = {'11': "Agriculture, forestry, fishing and hunting", "21": "Mining, quarrying, and oil and gas extraction", "22": "Utilities", "23": "Construction", "42": "Wholesale trade", "51": "Information", "52": "Finance and insurance", "53": "Real estate and rental and leasing", "54": "Professional, scientific, and technical services", "55": "Management of companies and enterprises", "56": "Administrative and support and waste management and remediation services", "61": "Educational services", "62": "Health care and social assistance", "71": "Arts, entertainment, and recreation", "72": "Accommodation and food services", "81": "Other services (except public administration)", "99": "Industries not classified", "--": "Total for all sectors"};
	$scope.active_area ="00970";
	$scope.current_naics2 = '--';
	//console.log($scope.stations);
	$scope.station_click = function(id){
		$scope.active_area = id;
	}
	$scope.isActive = function(id){
		///console.log(id,$scope.active_station);
		if(id == $scope.active_area){
			return 'active_area'
		}else{
			return '';
		}
	}
	$scope.trustSrc = function(src) {
    	return $sce.trustAsResourceUrl(src);
  	} 
	$scope.$watch('active_area',function(){
		var zip_split = JSON.stringify($scope.urbanAreas[$scope.active_area].zip_codes.split(',')).replace('[','').replace(']','').replace(/"/g,"'");
		d3.json('/zpb/total')
		.post(JSON.stringify({zip:zip_split,naics:$scope.current_naics2}),function(error,data){
			$scope.current_data = data;
			drawGroupGraph($scope);
			drawTotalGraph($scope);
			drawTable($scope);
		})
		d3.json('/zbp/totalEmployees')
		.post(JSON.stringify({zip:zip_split}),function(error,data){
			$scope.current_data = data;
			drawzbpTotalGraph($scope);
			drawQP1Graph($scope);
			drawAPGraph($scope);
		})
	});
	$scope.$watch('current_naics2',function(){
		var zip_split = JSON.stringify($scope.urban1Areas[$scope.active_area].zip_codes.split(',')).replace('[','').replace(']','').replace(/"/g,"'");
		d3.json('/zpb/total')
		.post(JSON.stringify({zip:zip_split,naics:$scope.current_naics2}),function(error,data){
			$scope.current_data = data;
			drawGroupGraph($scope);
			drawTotalGraph($scope);
			drawTable($scope);
		})
		d3.json('/zbp/totalEmployees')
		.post(JSON.stringify({zip:zip_split}),function(error,data){
			$scope.current_data = data;
			drawzbpTotalGraph($scope);
			drawQP1Graph($scope);
			drawAPGraph($scope);
		})
	});
	
});

function colorMap($scope){
	var color = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	d3.json("ny.json", function(error, ny) {
	  if (error) return console.error(error);

 	 // group tracts by color for faster rendering
 	svg.append("g")
      .attr("class", "tract")
    .selectAll("path")
      .data(d3.nest()
        .key(function(d) { return color(d.properties.population / d.properties.area * 2.58999e6); }) // convert square meters to square miles
        .entries(ny.objects.tracts.geometries))
    .enter().append("path")
      .style("fill", function(d) { return d.key; })
      .attr("d", function(d) { return path(topojson.merge(ny, d.values)); });
	});

	d3.select(self.frameElement).style("height", height + "px");
}
	
function drawTable($scope){
	var table = "<table class='table table-hover'><thead><tr><th></th><th>2010</th><th>2011</th><th>2012</th></tr></thead><tbody>";
	var data = parseData($scope);
	data.forEach(function(set){
		table+="<tr><td>"+set.key+"</td>";
		set.values.forEach(function(val){
			table+="<td>"+val.y+"</td>"
		})
		table+="</tr>"
	})
	table+="</tbody></table>";
	$('#dataTable').html(table);
}

function drawGroupGraph($scope){
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
			.rotateLabels(0)      //Angle to rotate x-axis labels.
			.showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
			.groupSpacing(0.1)
			.stacked(true)
			.showLegend(false)    //Distance between each group of bars.
			;

		chart.xAxis
			.tickFormat(d3.format(',f'));

		chart.yAxis
			.tickFormat(d3.format(',.1f'));

		d3.select('#barChart svg')
			.datum(parseData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
}

function drawTotalGraph($scope){
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
			.rotateLabels(0)      //Angle to rotate x-axis labels.
			.showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
			.groupSpacing(0.1)
			.stacked(true)
			.showLegend(false)    //Distance between each group of bars.
			;

		chart.xAxis
			.tickFormat(d3.format(',f'));

		chart.yAxis
			.tickFormat(d3.format(',.1f'));

		d3.select('#totalChart svg')
			.datum(parseTotalData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
}
function drawQP1Graph($scope){
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
			.rotateLabels(0)      //Angle to rotate x-axis labels.
			.showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
			.groupSpacing(0.1)
			.stacked(true)
			.showLegend(false)    //Distance between each group of bars.
			;
			chart.xAxis
			.tickFormat(d3.format(',f'));
		chart.yAxis
			.tickFormat(d3.format(',.1f'));

		d3.select('#qp1TotalChart svg')
			.datum(parseQP1TotalData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);
		return chart;
	});
}
function drawAPGraph($scope){
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
			.rotateLabels(0)      //Angle to rotate x-axis labels.
			.showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
			.groupSpacing(0.1)
			.stacked(true)
			.showLegend(false)    //Distance between each group of bars.
			;
			chart.xAxis
			.tickFormat(d3.format(',f'));
		chart.yAxis
			.tickFormat(d3.format(',.1f'));

		d3.select('#apTotalChart svg')
			.datum(parseAPTotalData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);
		return chart;
	});
}
function drawzbpTotalGraph($scope){
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
			.rotateLabels(0)      //Angle to rotate x-axis labels.
			.showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
			.groupSpacing(0.1)
			.stacked(true)
			.showLegend(false)    //Distance between each group of bars.
			;

		chart.xAxis
			.tickFormat(d3.format(',f'));
		chart.yAxis
			.tickFormat(d3.format(',.1f'));

		d3.select('#zbpTotalChart svg')
			.datum(parsezbpTotalData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);
		return chart;
	});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//Each bar represents a single discrete quantity.
function parseData($scope) {
	var output = [];
	
	var sizes = ["Establishments with 1 to 4 employees","Establishments with 5 to 9 employees","Establishments with 10 to 19 employees","Establishments with 20 to 49 employees","Establishments with 50 to 99 employees","Establishments with 100 to 249 employees","Establishments with 250 to 499 employees","Establishments with 500 to 999 employees","Establishments with 1,000 employees or more",]
	sizes.forEach(function(size, i){
		var dataSet = {};
		dataSet.key = size;
		dataSet.values = [];
		$scope.current_data.data.rows.forEach(function(row){
			dataSet.values.push({"series":"s"+i,"x":row.f[0].v,"y":parseInt(row.f[i+1].v)})
		});
		output.push(dataSet);
	})
	
  return output;
    

};

function parseTotalData($scope) {
	var output = [];
	var sizes = [avg2(1,4) , avg2(5, 9), avg2(10, 19), avg2(20, 49), avg2(50, 99), avg2(100, 249), avg2(250, 499), avg2(500, 999), 13700];
	var dataSet = {};
	dataSet.values= [];
	dataSet.key= "Calculated Total Number of Employees in the Area";
	console.log('current calculated data', $scope.current_data.data);
	$scope.current_data.data.rows.forEach(function(row){
		var total_employees = 0;
		sizes.forEach(function(size, i){
			total_employees += (parseInt(row.f[i+1].v) * size);
		});
		dataSet.values.push({"series":"s", "x":row.f[0].v, "y":total_employees});	
	});
	output.push(dataSet);
	return output;
};

function parsezbpTotalData($scope) {
	var output = [];
	var dataSet = {};
	dataSet.key = "Total Number of Employees in the Area";
	dataSet.values= [];
	console.log('current zbp data', $scope.current_data.data);
	$scope.current_data.data.rows.forEach(function(row){
		dataSet.values.push({"series":"s", "x":row.f[0].v, "y": parseInt(row.f[1].v)});
	});
	output.push(dataSet);
	return output;
};

function parseQP1TotalData($scope) {
	var output = [];
	var dataSet = {};
	dataSet.key = "Total First Quarter Payroll (in Thousands of USD)";
	dataSet.values= [];
	console.log('current qp1 data', $scope.current_data.data);
	$scope.current_data.data.rows.forEach(function(row){
		dataSet.values.push({"series":"s", "x":row.f[0].v, "y": parseInt(row.f[2].v)});
	});
	output.push(dataSet);
	return output;
};
function parseAPTotalData($scope) {
	var output = [];
	var dataSet = {};
	dataSet.key = "Total Annual Payroll (in Thousands of USD)";
	dataSet.values= [];
	console.log('current ap data', $scope.current_data.data);
	$scope.current_data.data.rows.forEach(function(row){
		dataSet.values.push({"series":"s", "x":row.f[0].v, "y": parseInt(row.f[3].v)});
	});
	output.push(dataSet);
	return output;
};
function avg2(num1, num2){
	return (num1 + num2)/2;
};