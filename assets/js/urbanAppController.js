app.controller('urbanAppController', function urbanAppController($scope){
	$scope.urbanAreas = {};
	urbanGeo = topojson.feature(urbanAreas, urbanAreas.objects['ny_urban_areas']);
	var sql = 'SELECT year,';	
	urbanGeo.features.forEach(function(d){
		//$scope.urbanAreas[d.properties.geoid] = d.properties;
		//console.log(d.properties);
		var name = d.properties.name,
			zipcodes = JSON.stringify(d.properties.zip_codes.split(',')).replace('[','').replace(']','').replace(/"/g,"'");
		sql += "sum(CASE WHEN zip in ("+zipcodes+") then emp END) as "+name.replace(/,/g,'').replace(/ /g,'_').replace(/--/g,'').replace(/NJ/g, '').replace(/CT/g, '').replace(/PA/g, '').replace(/\'/g,'')+"_employment,"	
	})
	sql += "FROM [zbp.zbp_totals] group by year, order by year asc;"
	d3.json('/zbp/totalEmployees')
		.post(JSON.stringify({sql:sql}),function(err,data){
			console.log('data returned',data);
			$scope.current_data=data;
			drawLineGraph($scope);
		})
});
function drawLineGraph($scope){
	nv.addGraph(function() {
		var chart = nv.models.lineChart()
			.useInteractiveGuideline(true)
			.transitionDuration(350)
			;

		chart.xAxis
			.axisLabel('Year')
			.tickFormat(d3.format(',f'));

		chart.yAxis
			.axisLabel('Total Mid March Employees')
			.tickFormat(d3.format(',.1f'));

		d3.select('#urbanEmploymentGraph svg')
			.datum(parseLineData($scope))
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
}
function parseLineData($scope){
	var output = [];
	
	//var columns=["Year", "Total Number of Employees"];
	var dataSet = {};
	//dataSet.key = "Total Annual Payroll (in Thousands of USD)";
	dataSet.values= [];
	console.log('current lineGraph emp data', $scope.current_data.data);
	$scope.current_data.data.rows.forEach(function(row){
		dataSet.values.push({"series":"s", "x":row.f[0].v, "y": parseInt(row.f[3].v)});
	});
	output.push(dataSet);
	return output;
}