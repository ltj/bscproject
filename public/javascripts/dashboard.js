/*
 * Setup socket and d3 environment
 */
var socket = io.connect('http://' + window.location.hostname);
var meterdata = [],
    digidata = [],
    n = 100,
    analogLineData = [],
    digitalLineData = [];

// initialize line data
for(var i = 0; i < 6; i++) {
    var pin = 'A'+i;
    analogLineData[pin] = [0];
}

for(var i = 0; i < 14; i++) {
    var pin = 'D'+i;
    digitalLineData[pin] = [0];
}

var width = 500,
    height = 90,
    twoPi = 2 * Math.PI;

var arc = d3.svg.arc()
    .startAngle(0)
    .innerRadius(30)
    .outerRadius(40);

var margin = {top: 5, right: 10, bottom: 5, left: 40},
    gWidth = width - 110 - margin.left - margin.right,
    gHeight = height - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, n - 1])
    .range([0, gWidth]);

var y = d3.scale.linear()
    .domain([0, 1023])
    .range([gHeight, 0]);

var line = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

var ana = d3.select("#analog-accordion");
var digi = d3.select("#digital-accordion");

/*
 * Socket event handlers
 */
socket.on('analog', function (data) {
    meterdata = data.data;
    for(var i = 0; i < meterdata.length; i++) {
        analogLineData[meterdata[i].pin].push(meterdata[i].reading);
        if(analogLineData[meterdata[i].pin].length === n) analogLineData[meterdata[i].pin].shift();
    }
    updateAnalogVisuals();
});

socket.on('digital', function (data) {
    digidata = data.data;
    for(var i = 0; i < digidata.length; i++) {
        digitalLineData[digidata[i].pin].push(digidata[i].reading);
        if(digitalLineData[digidata[i].pin].length === n) digitalLineData[digidata[i].pin].shift();
    }
    updateDigitalVisuals();
});

/*
 * D3 visualizations
 */
function updateAnalogVisuals() {
    var meter = ana.selectAll(".accordion-group").data(meterdata, function(d) { return d.pin; });

    // enter
    var entergroup = meter.enter().append("div")
        .attr("class", "accordion-group");

    var enterhead = entergroup.append("div")
        .attr("class", "accordion-heading")
        .append("a")
        .attr("class", "accordion-toggle")
        .attr("data-toggle", "collapse")
        .attr("href", function(d) {
            return "#" + d.pin + "-inner";
        })
        .text(function(d) {
            return d.pin;
        });

    var enter = entergroup.append("div")
        .attr("class", "accordion-body collapse in")
        .attr("id", function(d){
            return d.pin + "-inner";
        })
        .append("div")
        .attr("class", "accordion-inner")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var dial = enter.append("g")
        .attr("class", "analog-dial")
        .attr("transform", "translate(" + 70 + "," + 45 + ")");

    dial.append("path")
        .attr("class", "background")
        .attr("d", arc.endAngle(twoPi));

    dial.append("path")
        .attr("class", "foreground")
        .attr("d", function(d) {
            var endangle = (d.reading == 1023) ? twoPi : (twoPi / 1024) * d.reading;
            return arc.endAngle(endangle)();
        });

    dial.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.reading;
        });

    dial.append("text")
        .attr("x", "-70")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.pin;
        });

    var graph = enter.append("g")
        .attr("transform", "translate(" + (margin.left + 110) + "," + margin.top + ")");

    graph.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", gWidth)
        .attr("height", gHeight);

    graph.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));

    var path = graph.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(function(d) {
            return analogLineData[d.pin];
        })
        .attr("class", "line")
        .attr("d", line);

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

    meter.select(".line").datum(function(d) {
            return analogLineData[d.pin];
        })
        .attr("d", line)
        .attr("transform", null)
        .transition()
        .duration(500)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ")");

    // exit
    meter.exit().remove();
}

function updateDigitalVisuals() {
    var cspace = digi.selectAll(".chartActive");
    var display = cspace.selectAll("svg").data(digidata, function(d) { return d.pin; });

    // enter
    var enter = display.enter().append("svg")
        .attr("width", width)
        .attr("height", height);

    var graph = enter.append("g")
        .attr("transform", "translate(" + (margin.left + 110) + "," + margin.top + ")");

    graph.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", gWidth)
        .attr("height", gHeight);

    graph.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));

    var path = graph.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(function(d) {
            return digitalLineData[d.pin];
        })
        .attr("class", "line")
        .attr("d", line);

    // update
    meter.select(".line").datum(function(d) {
            return digitalLineData[d.pin];
        })
        .attr("d", line)
        .attr("transform", null)
        .transition()
        .duration(500)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ")");

    // exit
    meter.exit().remove();
}