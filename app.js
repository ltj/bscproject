
var config = require('./config'),
    express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    reflecta = require('reflecta'),
    async = require('async');

var app = express();

// configure express
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// set routes
app.get('/', routes.index);
app.get('/dash', routes.dash);
app.get('/test', routes.test);

// create server and socket listener
server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*  Reflecta/socket controller section. Should be put into own module
 *  at some point.
 */
var monitorTimeout,
    monAnalog,
    monDigital,
    analogMonitorPins = [],
    digitalMonitorPins = [];

// websockets connection and events
io.sockets.on('connection', function (socket) {
  socket.on('aread', function (data) {
    if(monitorTimeout) clearTimeout(monitorTimeout);
    analogMonitorPins = data.pins;
    monAnalog = data.pins.length !== 0;
    monitorPins(socket);
  });

  socket.on('dread', function (data) {
    if(monitorTimeout) clearTimeout(monitorTimeout);
    digitalMonitorPins = data.pins;
    monDigital = data.pins.length !== 0;
    monitorPins(socket);
  });

  socket.on('dwrite', function (data) {
    board.ardu1.digitalWrite(data.pin, data.val);
  });

  socket.on('pinmode', function (data) {
    console.log("pinmode called " + data.pin + " " + data.mode);
    board.ardu1.pinMode(data.pin, data.mode);
  });
});

// setup new board
var board = new reflecta.Board(config.serial.device, 
  { baudrate: config.serial.baudrate, delay: config.serial.delay });

var ready = false;
// reflecta events
board.on('error', function(error) {
  console.log("error " + error);
});

board.on('warning', function(warn) {
  console.log("warning " + warn);
});

board.on('ready', function() {
  if(board.ardu1) {
    console.log("Arduino connected.");
  }
});

// start analog pin monitor using async
function monitorPins(socket) {
  monitorTimeout = setTimeout(function() {
    if(monAnalog) {
      async.mapSeries(analogMonitorPins, queryAnalogPin, function(err, results) {
        if(err) {
          console.log(err);
        }
        else {
          socket.emit('analog', {data: results});
        }
      });
    }
    if(monDigital) {
      async.mapSeries(digitalMonitorPins, queryDigitalPin, function(err, results) {
        if(err) {
          console.log(err);
        }
        else {
          socket.emit('digital', {data: results});
        }
      });
    }
    monitorPins(socket);
    }, 100);
}

// analogRead with callback to async
function queryAnalogPin(pin, callback) {
  board.ardu1.analogRead(pin, function(val) {
    callback(null, {pin: 'A'+pin, reading: val});
  });
}

// digitalRead with callback to async
function queryDigitalPin(pin, callback) {
  board.ardu1.digitalRead(pin, function(val) {
    callback(null, {pin: 'D'+pin, reading: val});
  });
}
