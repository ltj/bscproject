
var config = require('./config'),
    express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    firmata = require('firmata'),
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
  socket.on('dwrite', function (data) {
    board.ardu1.digitalWrite(data.pin, data.val);
  });

  socket.on('pinmode', function (data) {
    console.log("pinmode called " + data.pin + " " + data.mode);
    board.ardu1.pinMode(data.pin, data.mode);
  });
});

// setup new board
var board = new firmata.Board(config.serial.device, function(err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Arduino connected');
  console.log('Firmware: ' + board.firmware.name + '-' +
              board.firmware.version.major + '.' + board.firmware.version.minor);

  board.pinMode(2, board.MODES.INPUT);
  board.reportVersion(function(ver) {
    console.log(ver);
  });
});

// firmata events
// board.on('analog-read', function (data) {
//   io.sockets.emit('analog-read', data);
// });

board.on('digital-read', function (data) {
  io.sockets.emit('digital-read', data);
});
