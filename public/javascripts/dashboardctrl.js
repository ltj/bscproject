/* ng controller for pin management */
function DashboardCtrl($scope) {

	// pins model
	//$scope.pins = [];

	// som svg parameters
	$scope.width = 300;
	$scope.height = 90;

	// modes
	$scope.modes = [
		'Input',
		'Output',
		'Analog',
		'PWM',
		'Servo'
	];

	// check if pin is not output
	$scope.pinNotOutput = function(pin) {
		return pin.mode !== 1;
	};

	// check if pin is not input
	$scope.pinNotInput = function(pin) {
		return pin.mode !== 0;
	};

	// check if pin is adjustable (PWM or servo output)
	$scope.pinIsAdjustable = function(pin) {
		return (pin.mode === 3 || pin.mode === 4);
	};

	// check if analog pin
	$scope.isAnalog = function(pin) {
		return pin.analogChannel < 127;
	};

	// check if digital pin
	$scope.isDigital = function(pin) {
		return (pin.analogChannel == 127 && pin.supportedModes.length > 0);
	};

	// toggle digital pin
	$scope.togglePin = function(pin, name) {
		if(pin.value === 0) {
			socket.emit('digital-write', { pin: name, value: 1 });
		}
		else {
			socket.emit('digital-write', { pin: name, value: 0 });
		}
	};

	// get digital value as text
	$scope.toggleText = function(pin) {
		var text = pin.value === 0 ? 'LOW' : 'HIGH';
		return text;
	};

	// set pin mode
	$scope.setPinMode = function(pin, name) {
		console.info('mode change request: pin=' + name + ' mode=' + pin.mode);
		socket.emit('pin-mode', { pin: name, mode: pin.mode });
	};

	// analog (PWM) or servo write
	$scope.adjustPinValue = function(pin, name) {
		if(pin.mode === 3)
			socket.emit('analog-write', { pin: name, value: pin.value });
		if(pin.mode === 4)
			socket.emit('servo-write', { pin: name, value: pin.value });
	};

}