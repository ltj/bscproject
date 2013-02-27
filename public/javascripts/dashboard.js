/*
 * Setup socket and d3 environment
 */
var socket = io.connect('http://' + window.location.hostname);

var meterdata = [];

var width = 400,
	height = 800,
	twoPi = 2 * Math.PI,
	progress = 0,
	total = 1308573, // must be hard-coded if server doesn't report Content-Length
	formatPercent = d3.format(".0%");

var arc = d3.svg.arc()
	.startAngle(0)
	.innerRadius(30)
	.outerRadius(40);

var svg = d3.select("#visual").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + 60 + "," + 60 + ")");

socket.on('analog', function (data) {
	meterdata = data.data;
	updateMeters();
});

function updateMeters() {
	var meter = svg.selectAll("g").data(meterdata, function(d) { return d.pin; });

	// enter
	var enter = meter.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + i * 90 + ")"; })
		.attr("class", "progress-meter");

	enter.append("path")
		.attr("class", "background")
		.attr("d", arc.endAngle(twoPi));

	enter.append("path")
		.attr("class", "foreground")
		.attr("d", function(d) {
			var endangle = (d.reading == 1023) ? twoPi : (twoPi / 1024) * d.reading;
			return arc.endAngle(endangle)();
		});

	enter.append("line")
		.attr("class", "maxline")
		.attr("x1", 0)
		.attr("y1", -arc.innerRadius()())
		.attr("x2", 0)
		.attr("y2", -arc.outerRadius()());

	enter.append("text")
		.attr("text-anchor", "middle")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.reading;
		});

	// update
	meter.select(".foreground")
		.attr("d", function(d) {
			var endangle = (d.reading == 1023) ? twoPi : (twoPi / 1024) * d.reading;
			return arc.endAngle(endangle)();
		});

	meter.select("text")
		.text(function(d) {
			return d.reading;
		});

	// exit
	meter.exit().remove();
}