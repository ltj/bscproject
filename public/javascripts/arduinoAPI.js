/*
 * Arduino data model
 */
var pins = [],
	modes = [
	'Input',
	'Output',
	'Analog',
	'PWM',
	'Servo'
	],
	version;


/*
 * Socket IO setup and events
 */
var socket = io.connect('http://' + window.location.hostname);

socket.on('board-status', function(data) {
	if(data.version) version = data.version;
});

socket.on('board-pins', function(data) {
	pins = data;
});

socket.on('pin-update', function(data) {
	pins[data.pin] = data.obj;
});

// query status to fetch version and pin layout
socket.emit('get-status', {});

/*
 * Arduino/Firmata functions
 */

 // digital write - toggle logic level (1 or 0) on digital pin
function digitalWrite(pin, value) {
	pins[pin].value = value;
	socket.emit('digital-write', { pin: pin, value: value });
}

// analog write - set PWM value (8bit, 0-255) on PWM pin
function analogWrite(pin, value) {
	pins[pin].value = value;
	socket.emit('analog-write', { pin: pin, value: value });
}

// set pin mode
function pinMode(pin, mode) {
	pins[pin].mode = mode;
	socket.emit('digital-write', { pin: pin, mode: mode });
}

// set callback for specific analog pin read event
function analogRead(pin, callback) {
	socket.on('analog-read-'+pin, function(data) {
		callback(data);
	});
}

// set callback for all analog read events
function analogReadAll(callback) {
	socket.on('analog-read', function(data) {
		callback(data);
	});
}

// set callback for specific digital pin read event
function digitalRead(pin, callback) {
	socket.on('digital-read-'+pin, function(data) {
		callback(data);
	});
}

// set callback for all digital read events
function digitalReadAll(callback) {
	socket.on('digital-read', function(data) {
		callback(data);
	});
}

// set the firmata sampling interval
// system default is 100ms, sketch is 19ms no less than 10ms
function samplingInterval(interval) {
	socket.emit('sampling-interval', interval);
}

// turn analog pin reporting on and off
function reportAnalogPin(pin, report) {
	pins[pin].report = report;
	socket.emit('report-analog-pin', {pin: pin, value: report});
}

