var config = require("./config"),
	reflecta = require('reflecta');

// setup new board
var board = new reflecta.Board(config.serial.device, 
	{ baudrate: config.serial.baudrate, delay: config.serial.delay });

// reflecta events
board.on('error', function(error) {
  console.log("error " + error);
});

board.on('warning', function(warn) {
  console.log("warning " + warn);
});

board.on('ready', function() {

  if(board.ardu1) {
    setInterval(function() {
        board.ardu1.analogRead(0, function(val) {
            io.sockets.socket(sid).emit('analog', { reading: val });
        });
    }, 100);
    console.log("ardu1 found");
    //board.ardu1.digitalWrite(13, 1);
  }
});