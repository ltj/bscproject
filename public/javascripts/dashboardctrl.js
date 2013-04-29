/* ng controller for pin management */
function DashboardCtrl($scope) {

	// pins model
	//$scope.pins = [];

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
		if(pin.value === 1) {
			socket.emit('digital-write', { pin: name, value: 0 });
		}
	};

	$scope.toggleText = function(pin) {
		var text = pin.value === 0 ? 'LOW' : 'HIGH';
		return text;
	};

}