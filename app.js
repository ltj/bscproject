
var config = require('./config'),
    express = require('express'),
    routes = require('./routes'),
    test = require('./routes/test'),
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
app.get('/test', test.test);

// create server and socket listener
server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*  Reflecta/socket controller section. Should be put into own module
 *  at some point.
 */
var analogMonitorInterval,
    analogMonitorPins,
    analogMonitorReadings = [];

io.sockets.on('connection', function (socket) {
  socket.on('amonitor', function (data) {
    analogMonitorPins = data.pins;
    monitorAnalog(socket);
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


function monitorAnalog(socket) {
  if(analogMonitorInterval) clearInterval(analogMonitorInterval);

  if(analogMonitorPins.length !== 0) {
    analogMonitorInterval = setInterval(function() {
      async.each(analogMonitorPins, queryAnalogPin, function(err) {
        if(err) {
          console.log(err);
        }
        else {
          socket.emit('analog', {data: analogMonitorReadings});
          analogMonitorReadings = []; // clear readings
        }
      });
    }, 100);
  }
}

function queryAnalogPin(pin, callback) {
  board.ardu1.analogRead(pin, function(val) {
    analogMonitorReadings.push({pin: 'A'+pin, reading: val});
    callback();
  });
}
