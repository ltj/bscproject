/*
 * Arduino data model
 */
var pins = [];

var modes = [
	'Input',
	'Output',
	'Analog',
	'PWM',
	'Servo'
];

/*
 * Socket IO setup and events
 */
var socket = io.connect('http://' + window.location.hostname);

socket.on('board-status', function() {

});

socket.on('board-pins', function() {

});

socket.on('analog-read', function() {

});

socket.on('digital-read', function() {

});

socket.on('pin-update', function() {

});

/*
 * Arduino/Firmata functions
 */
function digitalWrite(pin, value) {
	socket.emit('digital-write', { pin: pin, value: value });
}

function analogWrite(pin, value) {
	socket.emit('analog-write', { pin: pin, value: value });
}

function pinMode(pin, mode) {
	socket.emit('digital-write', { pin: pin, mode: mode });
}

function analogRead(pin, callback) {
	socket.on('analog-read-'+pin, function(data) {
		callback(data);
	});
}

function digitalRead(pin, callback) {
	socket.on('digital-read-'+pin, function(data) {
		callback(data);
	});
}

function samplingInterval(interval) {
	socket.emit('sampling-interval', interval);
}

function reportAnalogPin(pin, report) {
	socket.emit('report-analog-pin', {pin: pin, value: report});
}

