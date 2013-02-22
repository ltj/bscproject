var socket = io.connect('http://' + window.location.hostname);
console.log(window.location.hostname);

var maxval = 0;

socket.on('news', function (data) {
	console.log(data);
	document.getElementById("news").firstChild.nodeValue = data.hello;
	// socket.emit('my other event', { my: 'data' });
});
socket.on('analog', function (data) {
  //console.log(data);
  document.getElementById("reading").firstChild.nodeValue = data.reading;
  var endangle = (data.reading == 1023) ? twoPi :  (twoPi / 1024) * data.reading;
  foreground.attr("d", arc.endAngle(endangle));
  text.text(data.reading);
  
  if (data.reading > maxval) {
    maxval = data.reading;
    linemax.attr("transform", "rotate(" + (endangle * (180/Math.PI)) + ")");
  }

  // push a new data point onto the back
  datadata.push(data.reading);
 
  // redraw the line, and slide it to the left
  if(datadata.length == n) {
    path
        .attr("d", line)
        .attr("transform", null)
      .transition()
        .duration(500)
        .ease("linear")
        .attr("transform", "translate(" + x(-1) + ")");
   
    // pop the old data point off the front
    datadata.shift();
    return;
  }
  else {
    path.attr("d", line).attr("transform", null);
  }
});
socket.on('disconnect', function () {
	document.getElementById("news").firstChild.nodeValue = "oh no. lost connection";
});

var width = 300,
    height = 300,
    twoPi = 2 * Math.PI,
    progress = 0,
    total = 1308573, // must be hard-coded if server doesn't report Content-Length
    formatPercent = d3.format(".0%");

var arc = d3.svg.arc()
    .startAngle(0)
    .innerRadius(90)
    .outerRadius(120);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var meter = svg.append("g")
    .attr("class", "progress-meter");

meter.append("path")
    .attr("class", "background")
    .attr("d", arc.endAngle(twoPi));

var foreground = meter.append("path")
    .attr("class", "foreground");

var linemax = meter.append("line")
    .attr("class", "maxline")
    .attr("x1", 0)
    .attr("y1", -arc.innerRadius()())
    .attr("x2", 0)
    .attr("y2", -arc.outerRadius()());

var text = meter.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em");

var n = 100,
    datadata = [0];
 
var margin = {top: 10, right: 10, bottom: 20, left: 40},
    width = 600 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;
 
var x = d3.scale.linear()
    .domain([0, n - 1])
    .range([0, width]);
 
var y = d3.scale.linear()
    .domain([0, 1023])
    .range([height, 0]);
 
var line = d3.svg.line()
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });
 
var svg2 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
svg2.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);
 
svg2.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));
 
var path = svg2.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .data([datadata])
    .attr("class", "line")
    .attr("d", line);
