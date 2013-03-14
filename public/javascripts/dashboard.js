/*
 * Setup socket and d3 environment
 */
var socket = io.connect('http://' + window.location.hostname);
var meterdata = [];

var width = 500,
	height = 90,
	twoPi = 2 * Math.PI,
	progress = 0,
	total = 1308573, // must be hard-coded if server doesn't report Content-Length
	formatPercent = d3.format(".0%");

var arc = d3.svg.arc()
	.startAngle(0)
	.innerRadius(30)
	.outerRadius(40);

var ana = d3.select("#analog-accordion");

/*
 * Socket event handlers
 */
socket.on('analog', function (data) {
	meterdata = data.data;
	updateAnalogVisuals();
});

/*
 * D3 visualizations
 */
function updateAnalogVisuals() {
	var meter = ana.selectAll(".accordion-group").data(meterdata, function(d) { return d.pin; });

	// enter
	var enter = meter.enter().append("div")
		.attr("class", "accordion-group")
		.append("div")
		.attr("class", "accordion-heading")
		.append("a")
		.attr("class", "accordion-toggle")
		.attr("data-toggle", "collapse")
		.attr("data-parent", "#analog-accordion")
		.attr("href", function(d) {
			return "#" + d.pin + "-inner";
		})
		.text(function(d) {
			return d.pin;
		})
		.append("div")
		.attr("class", "accordion-body collapse in")
		.attr("id", function(d){
			return d.pin + "-inner";
		})
		.append("div")
		.attr("class", "accordion-inner")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("class", "analog-dial")
		.attr("transform", "translate(" + 70 + "," + 45 + ")");

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