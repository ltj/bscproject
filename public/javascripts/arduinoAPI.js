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

// query status
socket.emit('get-status', {});

/*
 * Arduino/Firmata functions
 */
function digitalWrite(pin, value) {
	pins[pin].value = value;
	socket.emit('digital-write', { pin: pin, value: value });
}

function analogWrite(pin, value) {
	pins[pin].value = value;
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

function analogReadAll(callback) {
	socket.on('analog-read', function(data) {
		callback(data);
	});
}

function digitalRead(pin, callback) {
	socket.on('digital-read-'+pin, function(data) {
		callback(data);
	});
}

function digitalReadAll(callback) {
	socket.on('digital-read', function(data) {
		callback(data);
	});
}

function samplingInterval(interval) {
	socket.emit('sampling-interval', interval);
}

function reportAnalogPin(pin, report) {
	socket.emit('report-analog-pin', {pin: pin, value: report});
}

