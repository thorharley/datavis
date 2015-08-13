window.onload = function init() {

	var margin = {
			top: 20,
			right: 80,
			bottom: 50,
			left: 50
		},
		width = 1260 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.category20();

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickValues(d3.range(d3.min(data, function(d) {
			return xDomain(d);
		}), d3.max(data, function(d) {
			return xDomain(d);
		}), 10));

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) {
			return x(d.year);
		})
		.y(function(d) {
			return y(d.deviation);
		});

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("text")
		.attr("x", width / 2)
		.attr("y", 0)
		.style("text-anchor", "middle")
		.attr("class", "title")
		.text('Global, Hemispheric and Zonal Annual Temperature Deviation Means 1880-2014');

	svg.append("text")
		.attr("x", 0)
		.attr("y", height+45)
		.style("text-anchor", "start")
		.text('Source data: http://data.giss.nasa.gov/gistemp/');

	color.domain(d3.keys(data[0]).filter(function(key) {
		return key !== "Year";
	}));

	var regions = color.domain().map(function(name) {
		return {
			name: name,
			values: data.map(function(d) {
				return {
					year: d.Year,
					deviation: +(d[name] / 100)
				};
			})
		};
	});

	x.domain(data.map(function(d) {
		return xDomain(d);
	}));
	y.domain([
		d3.min(regions, function(r) {
			return d3.min(r.values, function(v) {
				return v.deviation;
			});
		}),
		d3.max(regions, function(r) {
			return d3.max(r.values, function(v) {
				return v.deviation;
			});
		})
	]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "axis-label")
		.attr("y", 40)
		.attr("x", width / 2)
		.style("text-anchor", "end")
		.text("Year");

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "axis-label")
		.attr("transform", "rotate(-90)")
		.attr("y", -30)
		.attr("x", -height / 2 + 80)
		.style("text-anchor", "end")
		.text("Mean Surface Temperature Deviation (C)");

	var region = svg.selectAll(".region")
		.data(regions)
		.enter().append("g")
		.attr("class", "region");

	region.append("path")
		.attr("class", function(d) {
			return "line";
		})
		.attr("d", function(d) {
			return line(d.values);
		})
		.style("stroke", function(d) {
			return color(d.name);
		})
		.style("stroke-width", function(d) {
			return lineWidth(d.name);
		});


	region.append("text")
		.datum(function(d) {
			return {
				name: d.name,
				value: d.values[d.values.length - 1]
			};
		})
		.attr("transform", function(d, i) {
			return "translate(" + x(d.value.year) + "," + y(d.value.deviation) + ")";
		})
		.attr("x", 4)
		.attr("dy", ".35em")
		.style("fill", function(d) {
			return d.color = color(d.name);
		})
		.text(function(d) {
			return d.name;
		});

	var legendWidthOffset = width - 30;
	var legendHeightOffset = 3 * height / 5;

	regions.forEach(function(d, i) {
		svg.append("text")
			.attr("x", legendWidthOffset)
			.attr("y", legendHeightOffset - 20)
			.attr("class", "legend-title")
			.style("text-anchor", "end")
			.text('Zones');
		svg.append("text")
			.attr("x", legendWidthOffset)
			.attr("y", legendHeightOffset + i * 16)
			.attr("class", "legend")
			.style("fill", function() {
				return d.color = color(d.name);
			})
			.style("text-anchor", "start")
			.text(d.name);
		svg.append("line")
			.attr("x1", legendWidthOffset - 10)
			.attr("x2", legendWidthOffset - 80)
			.attr("y1", legendHeightOffset + i * 16)
			.attr("y2", legendHeightOffset + i * 16)
			.attr("class", "legend-line")
			.style("stroke", function() {
				return d.color = color(d.name);
			})
			.style("stroke-width", lineWidth(d.name));
	});

};

function xDomain(d) {
	return parseInt(d.Year, 10);
}

function lineWidth(name) {
	if (name === 'Glob') {
		return '4px';
	} else if (name === 'NHem' || name === 'SHem') {
		return '3px';
	}
	return '1px';
}