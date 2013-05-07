
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

io.configure('production', function(){
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 1);                    // reduce logging

  // enable all transports (optional if you want flashsocket support, please note that some hosting
  // providers do not allow you to create servers that listen on a port different than 80 or their
  // default port)
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/*  Reflecta/socket controller section. Should be put into own module
 *  at some point.
 */
var monitorTimeout,
    monAnalog,
    monDigital,
    boardError,
    analogMonitorPins = [],
    digitalMonitorPins = [];

// setup new board
var board = new firmata.Board(config.serial.device, function(err) {
  if (err) {
    boardError = err;
    console.log("Firmata error: " + err);
    return;
  }
  console.log('Arduino connected');
  console.log('Firmware: ' + board.firmware.name + '-' +
              board.firmware.version.major + '.' + board.firmware.version.minor);

  // set safe sampling interval
  board.setSamplingInterval(100);

});

// websockets connection and events
io.sockets.on('connection', function (socket) {

    socket.on('get-status', function(data) {
      if(typeof(board) == 'object' && board.versionReceived) {
        var firmware = 'Firmware: ' + board.firmware.name + '-' +
                        board.firmware.version.major + '.' + board.firmware.version.minor;
        socket.emit('board-status', board.firmware);
        socket.emit('board-pins', board.pins);
      }
      else {
        socket.emit('board-status', { errmsg: boardError.toString() });
      }
    });

    socket.on('digital-write', function(data) {
      board.digitalWrite(data.pin, data.value);
      // broadcast value changes (HI/LOW or PWM)
      io.sockets.emit('pin-update', { pin: data.pin, obj: board.pins[data.pin] });
    });

    socket.on('pin-mode', function(data) {
      board.pinMode(data.pin, data.mode);
      // broadcast mode change
      io.sockets.emit('pin-update', { pin: data.pin, obj: board.pins[data.pin] });
    });

    socket.on('analog-write', function(data) {
      board.analogWrite(data.pin, data.value);
      // broadcast value changes (HI/LOW or PWM)
      socket.broadcast.volatile.emit('pin-update', { pin: data.pin, obj: board.pins[data.pin] });
    });

    socket.on('servo-write', function(data) {
      board.servoWrite(data.pin, data.value);
      // broadcast value changes (HI/LOW or PWM)
      io.sockets.emit('pin-update', { pin: data.pin, obj: board.pins[data.pin] });
    });

    socket.on('sampling-interval', function(data) {
      board.setSamplingInterval(data);
    });

    socket.on('report-analog-pin', function(data) {
      board.reportAnalogPin(data.pin, Number(data.value));
      socket.broadcast.emit('pin-update', { pin: data.pin, obj: board.pins[data.pin] });
    });

    socket.on('reset-board', function(data) {

      board.reset();
      setTimeout(function() {
        board.reportVersion(function() {
          board.queryFirmware(function() {
            board.queryCapabilities(function() {
              board.queryAnalogMapping(function() {
                console.info('Reset complete');
              });
            });
          });
        });
      }, 200);

      board.setSamplingInterval(100);

    });

});

// firmata events
board.on('analog-read', function (data) {
  // broadcast analog reads as volatile (no ack)
  io.sockets.volatile.emit('analog-read', data);
});

board.on('digital-read', function (data) {
  // broadcast digital reads as volatile (no ack)
  io.sockets.volatile.emit('digital-read', data);
});
