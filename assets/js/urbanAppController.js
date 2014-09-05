app.controller('urbanAppController', function urbanAppController($scope){
	$scope.urbanAreas = {};
	urbanGeo = topojson.feature(urbanAreas, urbanAreas.objects['ny_urban_areas']);
	var sql = 'SELECT year,';	
	urbanAreaNames = [];
	urbanGeo.features.forEach(function(d){
		//$scope.urbanAreas[d.properties.geoid] = d.properties;
		//console.log(d.properties);
		urbanAreaNames.push(d.properties.name);
		var name = d.properties.name,
			zipcodes = JSON.stringify(d.properties.zip_codes.split(',')).replace('[','').replace(']','').replace(/"/g,"'");
		sql += "sum(CASE WHEN zip in ("+zipcodes+") then emp END) as "+name.replace(/,/g,'').replace(/ /g,'_').replace(/--/g,'').replace(/NJ/g, '').replace(/CT/g, '').replace(/PA/g, '').replace(/\'/g,'')+"_employment,"	
	})

	sql += "FROM [zbp.zbp_totals] group by year, order by year asc;"
	d3.json('/zbp/urbanTotalEmployees')
		.post(JSON.stringify({sql:sql}),function(err,data){
			$scope.current_data = data;
			//drawVoronoi($scope);
			drawLineGraph($scope);
		})
});

function drawVoronoi($scope){

	var margin = {top: 20, right: 30, bottom: 30, left: 40},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
		.domain([1994, 2012])
	    .range([0, width]);

	var y = d3.scale.linear()
		.domain([0, 3000000]) //temporary-this domain specific for this dataset
	    .range([height, 0]);

	var color = d3.scale.category20();

	var data = parseVoronoiData($scope);

	/*var voronoi = d3.geom.voronoi()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.value); })
	    .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);*/

	var line = d3.svg.line()
	    .x(function(d) { return x(d.value); })
	    .y(function(d) { return y(d.value); });

	var svg = d3.select("urbanEmploymentGraph svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xAxis = d3.svg.axis()
		.scale(x)
		.tickSize(-height)
		.tickSubdivide(true)
		//.orient("bottom")
	  .append("text")
	    .attr(".dy", ".32em")
	    .style("font-weight", "bold")
	    .text("Year");

	svg.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	var yAxis = d3.svg.axis()
		.scale(y)
		.ticks(4)
		.orient("left")
	  .append("text")
	    .attr("x", 4)
	    .attr("dy", ".32em")
	    .style("font-weight", "bold")
	    .text("Total Mid-March Employees");

	svg.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(-25,0)")
		.call(yAxis);

	svg.append("g")
		.attr("class", "urbanAreas")
	  .selectAll("path")
	    .data(data);

	data.forEach(function(d){
		graph.append("path").attr("d", line(data));
	});

	  // .enter().append("path")
	  //   .attr("d", function(d) { d.line = this; return line(d.values); });

	/*d3.tsv("unemployment.tsv", type, function(error, cities) { //Start of voronoi/tsv
	  svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.svg.axis()
	        .scale(x)
	        .orient("bottom"))
	      .append("text")
	        .attr(".dy", ".32em")
	        .style("font-weight", "bold")
	        .text("Year");

	  svg.append("g")
	      .attr("class", "axis axis--y")
	      .call(d3.svg.axis()
	        .scale(y)
	        .orient("left")
	        .ticks(10, "%"))
	    .append("text")
	      .attr("x", 4)
	      .attr("dy", ".32em")
	      .style("font-weight", "bold")
	      .text("Total Mid-March Employees");

	  svg.append("g")
	      .attr("class", "Urban Area")
	    .selectAll("path")
	      .data(cities)
	    .enter().append("path")
	      .attr("d", function(d) { d.line = this; return line(d.values); });

	  var focus = svg.append("g")
	      .attr("transform", "translate(-100,-100)")
	      .attr("class", "focus");

	  focus.append("circle")
	      .attr("r", 3.5);

	  focus.append("text")
	      .attr("y", -10);

	  var voronoiGroup = svg.append("g")
	      .attr("class", "voronoi");

	  voronoiGroup.selectAll("path")
	      .data(voronoi(d3.nest()
	          .key(function(d) { return x(d.date) + "," + y(d.value); })
	          .rollup(function(v) { return v[0]; })
	          .entries(d3.merge(cities.map(function(d) { return d.values; })))
	          .map(function(d) { return d.values; })))
	    .enter().append("path")
	      .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
	      .datum(function(d) { return d.point; })
	      .on("mouseover", mouseover)
	      .on("mouseout", mouseout);

	  d3.select("#show-voronoi")
	      .property("disabled", false)
	      .on("change", function() { voronoiGroup.classed("voronoi--show", this.checked); });

	  function mouseover(d) {
	    d3.select(d.city.line).classed("city--hover", true);
	    d.city.line.parentNode.appendChild(d.city.line);
	    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
	    focus.select("text").text(d.city.name);
	  }

	  function mouseout(d) {
	    d3.select(d.city.line).classed("city--hover", false);
	    focus.attr("transform", "translate(-100,-100)");
	  }
	}); //End of voronoi/tsv

	function type(d, i) {
	  if (!i) months = Object.keys(d).map(monthFormat.parse).filter(Number);
	  var city = {
	    name: d.name.replace(/ (msa|necta div|met necta|met div)$/i, ""),
	    values: null
	  };
	  city.values = months.map(function(m) {
	    return {
	      city: city,
	      date: m,
	      value: d[monthFormat(m)] / 100
	    };
	  });
	  return city;
	}*/
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