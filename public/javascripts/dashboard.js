/*
 * Setup socket and d3 environment
 */
var socket = io.connect('http://' + window.location.hostname);

var anadata = [],
    digidata = [],
    n = 100,
    analogLineData = [],
    digitalLineData = [],
    init = false,
    offset = 2;

var width = 400,
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

var cy = d3.scale.linear()
    .domain([0, 1])
    .rangeRound([gHeight, 0]);

var line = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

var cline = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return cy(d); });

/*
 * Socket event handlers
 */

socket.on('board-status', function(data) {
    if(data.version !== undefined) {
        $('#status-msg').addClass('text-success').
        text('Arduino connected: ' + data.name + ' v' + data.version.major + "." + data.version.minor);
    }
    else {
        console.log(data);
        $('#status-msg').addClass('text-error').text(data.errmsg);
    }
});

socket.on('board-pins', function(data) {
    var scope  = angular.element($('.container-fluid')).scope();
    scope.$apply( function() { scope.pins = data; });
    // initialize d3 data arrays the first time
    if(! init) {
        for(var i = 0; i < data.length; i++) {
            //digital pins
            if(data[i].analogChannel === 127) {
                digidata[i] = {pin: i, value: 0};
                digitalLineData[i] = [0];
            }
            // analog pins
            if(data[i].analogChannel !== 127) {
                anadata[data[i].analogChannel] = {pin: data[i].analogChannel, value: 0};
                analogLineData[data[i].analogChannel] = [0];
            }
        }
        setupAnalogVisuals();
        init = true;
    }
});

socket.on('pin-update', function(data) {
    var scope  = angular.element($('.container-fluid')).scope();
    scope.$apply( function() { scope.pins[data.pin] = data.obj; });
});

socket.on('analog-read', function (data) {
    if(init) {
        // update visualizations
        anadata[data.pin].value = data.value;
        analogLineData[data.pin].push(data.value);
        // we only want n samples at any time
        if(analogLineData[data.pin].length === n) analogLineData[data.pin].shift();
        updateAnalogVisuals(data.pin);
    }
});

socket.on('digital-read', function (data) {
    if(init) {
        // update model
        var scope  = angular.element($('.container-fluid')).scope();
        scope.$apply( function() { scope.pins[data.pin].value = data.value; });
    }
});

// query status
socket.emit('get-status', {});

/*
 * D3 visualizations
 */
function setupAnalogVisuals() {
    for(var i = 0; i < anadata.length; i++) {
        var pindata = anadata[i];
        var container = d3.select('#achart' + anadata[i].pin);
        var chart = container.selectAll("svg").data([pindata]);

        // enter
        var enter = chart.enter().append("svg")
            .attr("width", width)
            .attr("height", height);

        var dial = enter.append("g")
            .attr("class", "analog-dial")
            .attr("transform", "translate(" + 50 + "," + 45 + ")");

        dial.append("path")
            .attr("class", "background")
            .attr("d", arc.endAngle(twoPi));

        dial.append("path")
            .attr("class", "foreground")
            .attr("d", 0);

        dial.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(0);
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
            .datum(0)
            .attr("class", "line")
            .attr("d", line);
        }
}

function updateAnalogVisuals(pin) {

    var chart = d3.select('#achart' + anadata[pin].pin).select("svg")
        .data([anadata[pin]]);

    // update
    chart.select(".foreground")
        .attr("d", function(d) {
            var endangle = (d.value == 1023) ? twoPi : (twoPi / 1024) * d.value;
            return arc.endAngle(endangle)();
        });

    chart.select("text")
        .text(function(d) {
            return d.value;
        });

    chart.select(".line").datum(function(d) {
            return analogLineData[d.pin];
        })
        .attr("d", line)
        .attr("transform", null)
        .transition()
        .duration(500)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ")");

}