var max, min;
var idNameMap = {};
var idConnectionMap = {};

window.onload = function init() {
	

	var graph = parseData();

	var width = 1200,
		height = 900;


	var force = d3.layout.force()
		.charge(-400)
		.linkDistance(100)
		.size([width, height]);

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);

		force
			.nodes(graph.nodes)
			.links(graph.edges)
			.start();

		max = _.max(force.nodes(), function(node) {
			return node.weight;
		}).weight;
		min = _.min(force.nodes(), function(node) {
			return node.weight;
		}).weight;

		var link = svg.selectAll(".link")
			.data(graph.edges)
			.enter().append("line")
			.attr("class", "link");

		var node = svg.selectAll(".node")
			.data(graph.nodes)
			.enter().append("circle")
			.on('mouseenter', mouseEnter)
			.attr("class", "node")
			.attr("r", function(d) {
				return 3*Math.pow(d.weight, 0.8); 
			})
			.style("fill", function(d) {
				return d3.hsl(200, 1, 1-d.weight/(1.5*max));
			})
			.call(force.drag);

		node.append("title")
			.text(function(d) {
				var connections = _.map(idConnectionMap[d.id], function(id) {
					return idNameMap[id];
				}).join(', ');
				return d.label + ', '+d.weight+(d.weight > 1 ? ' connections: ' : ' connection: ')+connections;
			});

		link.append("title")
			.text(function(d) {
				return d.sourceLabel + ' <---> ' + d.targetLabel;
			});

		force.on("tick", function() {
			link.attr("x1", function(d) {
					return d.source.x;
				})
				.attr("y1", function(d) {
					return d.source.y;
				})
				.attr("x2", function(d) {
					return d.target.x;
				})
				.attr("y2", function(d) {
					return d.target.y;
				});

			node.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});
		});

	svg.append("text")
		.attr("x", width / 2)
		.attr("y", 20)
		.style("text-anchor", "middle")
		.attr("class", "title")
		.text('Social network of 62 dolphins, Doubtful Sound, New Zealand');

	svg.append("text")
		.attr("x", width / 2)
		.attr("y", 35)
		.attr("class", "source")
		.text('Source data: https://networkdata.ics.uci.edu/data.php?id=6');
	

	function mouseEnter(d) {
		var name = d.label;
		var weight = d.weight;
	}

	function parseData() {

		_.each(data.nodes, function(node) {
			idNameMap[node.id] = node.label;
			idConnectionMap[node.id] = [];
		});
		_.each(data.edges, function(edge) {
			edge.sourceLabel = idNameMap[edge.source];
			edge.targetLabel = idNameMap[edge.target];
			idConnectionMap[edge.source].push(edge.target);
			idConnectionMap[edge.target].push(edge.source);

		});
		return data;
	}
};