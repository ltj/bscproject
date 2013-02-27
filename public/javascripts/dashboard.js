/*
 * Setup socket and d3 environment
 */
var socket = io.connect('http://' + window.location.hostname);
var meterdata = [];

var width = 500,
	height = 0,
	twoPi = 2 * Math.PI,
	progress = 0,
	total = 1308573, // must be hard-coded if server doesn't report Content-Length
	formatPercent = d3.format(".0%");

var arc = d3.svg.arc()
	.startAngle(0)
	.innerRadius(30)
	.outerRadius(40);

var svg = d3.select("#dials").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + 70 + "," + 60 + ")");

/*
 * Socket event handlers
 */
socket.on('analog', function (data) {
	meterdata = data.data;
	updateDials();
});

/*
 * D3 visualizations
 */
function updateDials() {
	var canvas = d3.select("svg");
	var meter = svg.selectAll("g").data(meterdata, function(d) { return d.pin; });

	// enter
	var enter = meter.enter().append("g")
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + i * 90 + ")"; })
		.attr("class", "analog-dial")
		.each(function() {
			canvas.attr("height", Number(canvas.attr("height")) + 100);
		});

	enter.append("path")
		.attr("class", "background")
		.attr("d", arc.endAngle(twoPi));

	enter.append("path")
		.attr("class", "foreground")
		.attr("d", function(d) {
			var endangle = (d.reading == 1023) ? twoPi : (twoPi / 1024) * d.reading;
			return arc.endAngle(endangle)();
		});

	enter.append("text")
		.attr("text-anchor", "middle")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.reading;
		});

	enter.append("text")
		.attr("x", "-70")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.pin;
		});

	// update
	meter.transition()
		.duration(150)
		.attr("transform", function(d, i) { return "translate(" + 0 + "," + i * 90 + ")"; });

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
	meter.exit().remove()
		.each(function() {
			canvas.transition()
				.duration(600).attr("height", Number(canvas.attr("height")) - 100);
		});
}

function updateCharts() {

}
