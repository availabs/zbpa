app.controller('urbanAppController', function urbanAppController($scope){
	$scope.urbanAreas = {};
	urbanGeo = topojson.feature(urbanAreas, urbanAreas.objects['ny_urban_areas']);
	var sql = 'SELECT year,';	
	urbanAreaNames = [];
	urbanGeo.features.forEach(function(d){
		//$scope.urbanAreas[d.properties.geoid] = d.properties;
		//console.log(d.properties);
		urbanAreaNames.push(d.properties.name + " Employment");
		var name = d.properties.name,
			zipcodes = JSON.stringify(d.properties.zip_codes.split(',')).replace('[','').replace(']','').replace(/"/g,"'");
		sql += "sum(CASE WHEN zip in ("+zipcodes+") then emp END) as "+name.replace(/,/g,'').replace(/ /g,'_').replace(/--/g,'').replace(/NJ/g, '').replace(/CT/g, '').replace(/PA/g, '').replace(/\'/g,'')+"_employment,"	
	})

	sql += "FROM [zbp.zbp_totals] group by year, order by year asc;"
	//console.log(sql);
	d3.json('/zbp/urbanTotalEmployees')
		.post(JSON.stringify({sql:sql}),function(err,data){
			$scope.current_data = data;
			drawVoronoi($scope);
			//drawLineGraph($scope);
		})
});



function drawVoronoi($scope){

	var m = [80, 80, 80, 80]; // margins
	var w = 1000 - m[1] - m[3];	// width
	var h = 550 - m[0] - m[2]; // height

	var x = d3.scale.linear()
		.domain([1994, 2012])
	    .range([0, w]);

	var y = d3.scale.linear()
		.domain([0, 800000]) 
		.range([h, 0]);

	

	var data = parseVoronoiData($scope);
	console.log(data);
	var line = d3.svg.line()
		.x(function(d) { 
			//console.log('Plotting X1 value for data point');
			return x(d[0]); 
		})
		.y(function(d) { 
			//console.log('Plotting Y1 value for data point');
			return y(d[1]); 
		})

	var graph = d3.select("#urbanEmploymentGraph svg")
	      .attr("width", w + m[1] + m[3])
		  .attr("height", h + m[0] + m[2])
	    .append("g")
	      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	
	var voronoi = d3.geom.voronoi()
		.x(function(d) {return x(d[0]); })
		.y(function(d) {return y(d[1]); })
		.clipExtent([[-80, -80], [w + 80, h + 80]]);

	var focus = graph.append("g")
      .attr("transform", "translate(-100,-100)")
      .attr("class", "focus");
    
    focus.append("circle")
      .attr("r", 3.5);

  	focus.append("text")
      .attr("y", -10);

	var xAxis = d3.svg.axis()
		.scale(x)
		.ticks(18)
		.orient("bottom");

	graph.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis)
	  .append("text")
	    //.attr(".dy", ".32em")
	    .style("font-weight", "bold")
	    .text("Year");
 
	var yAxis = d3.svg.axis()
		.scale(y)
		.ticks(16)
		.orient("left");

	graph.append("g")
		.attr("class", "yAxis")
		.attr("transform", "translate(-25,0)")
		.call(yAxis)
	  .append("text")
	    .attr("x", 4)
	    //.attr("dy", ".32em")
	    .style("font-weight", "bold")
	    .text("Total Mid-March Employees");



	graph.append("g")
		.attr("class", "urbanAreas")
	  .selectAll("path")
	    .data(data)
		.enter().append("path")
			.attr("class", function(d,i){ d.name = urbanAreaNames[i]; return 'data '+urbanAreaNames[i];})
			.attr('d',function(d,i) { d.line = this; return line(d); });
	console.log(data);
	
	voronoiGroup = graph.append("g")
		.attr("class", "voronoi");

	voronoiGroup.selectAll("path")
		.data(voronoi(d3.nest()
			.key(function(d) { return x(d[0]) + "," + y(d[1]); })
			.rollup(function(v) { return v[0]; })
			.entries(d3.merge(data.map(function(d) { return d})))
			.map(function(d) { return d.values})))
	  .enter().append("path")
		.attr("d", function(d) {  return "M" + d.join("L") + "Z"; })
		.datum(function(d) {return d; })
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);

	d3.select("#show-voronoi")
		.property("disabled", false)
		.on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });

		function mouseover(d,i) {
			//console.log("d: " + d);
			console.log("d[0]: ",d,i);
			//d3.select(d.city.line).classed("city--hover", true);
			//d.city.line.parentNode.appendChild(d.city.line);
			//console.log()
			focus.attr("transform", "translate(" + x(d.point[0]) + "," + y(d.point[1]) + ")");
			//focus.attr("transform", "translate(" + x(d[0]) + "," + y(d[1]) + ")");
			//focus.select("text").text(d.city.name);
		}
		function mouseout(d) {
			//d3.select(d.city.line).classed("city--hover", false);
			focus.attr("transform", "translate(-100,-100)");
		}
}

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
function parseVoronoiData($scope){
	var output = []; //need a triple dim array- arrays of x/ys in one city array in one big array.
	var city = [];
	var data_columns = $scope.current_data.data.rows[0].f.length;
	//var dataSet = {};
	//dataSet.values= [];
	console.log('current voronoi lineGraph emp data', $scope.current_data.data);
	/*$scope.current_data.data.rows.forEach(function(row){
		i++;
		city.push([parseInt(row.f[0].v), parseInt(row.f[i].v)]);
		//dataSet.values.push({"x":row.f[0].v, "y": parseInt(row.f[3].v)});
	}
	, output.push(city)
	);*/
	
	for(var i=0, b=1; i<data_columns, b<data_columns; i++, b++){
	//$scope.current_data.data.rows.forEach(function(row1, rowNum){ // outer loop for every year
		city = [];

			$scope.current_data.data.rows.forEach(function(row){ // outer loop for each city
				//row.f.forEach(function(col){ //going through this row.
					city.push([parseInt(row.f[0].v), 
						parseInt(row.f[b].v)])
				//});
			},
			output.push(city));
	
	}//);
	return output;
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