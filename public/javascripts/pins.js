/* ng controller for pin management */
function PinCtrl($scope) {

	$scope.analogPins = [
		{ name: 'A0', value: 0, monitor: false },
		{ name: 'A1', value: 1, monitor: false },
		{ name: 'A2', value: 2, monitor: false },
		{ name: 'A3', value: 3, monitor: false },
		{ name: 'A4', value: 4, monitor: false },
		{ name: 'A5', value: 5, monitor: false }];

	$scope.digitalPins = [
		{ name: 'D0', value: 0, direction: false, toggle: false },
		{ name: 'D1', value: 1, direction: false, toggle: false },
		{ name: 'D2', value: 2, direction: false, toggle: false },
		{ name: 'D3', value: 3, direction: false, toggle: false },
		{ name: 'D4', value: 4, direction: false, toggle: false },
		{ name: 'D5', value: 5, direction: false, toggle: false },
		{ name: 'D6', value: 6, direction: false, toggle: false },
		{ name: 'D7', value: 7, direction: false, toggle: false },
		{ name: 'D8', value: 8, direction: false, toggle: false },
		{ name: 'D9', value: 9, direction: false, toggle: false },
		{ name: 'D10', value: 10, direction: false, toggle: false },
		{ name: 'D11', value: 11, direction: false, toggle: false },
		{ name: 'D12', value: 12, direction: false, toggle: false },
		{ name: 'D13', value: 13, direction: false, toggle: false }];

	$scope.digitalPins1 = [
		{ name: 'D0', value: 0, direction: false, toggle: false },
		{ name: 'D1', value: 1, direction: false, toggle: false },
		{ name: 'D2', value: 2, direction: false, toggle: false },
		{ name: 'D3', value: 3, direction: false, toggle: false },
		{ name: 'D4', value: 4, direction: false, toggle: false },
		{ name: 'D5', value: 5, direction: false, toggle: false },
		{ name: 'D6', value: 6, direction: false, toggle: false }];

	$scope.digitalPins2 = [
		{ name: 'D7', value: 7, direction: false, toggle: false },
		{ name: 'D8', value: 8, direction: false, toggle: false },
		{ name: 'D9', value: 9, direction: false, toggle: false },
		{ name: 'D10', value: 10, direction: false, toggle: false },
		{ name: 'D11', value: 11, direction: false, toggle: false },
		{ name: 'D12', value: 12, direction: false, toggle: false },
		{ name: 'D13', value: 13, direction: false, toggle: false }];

	$scope.setMonitor = function(pin) {
		pin.monitor = ! pin.monitor;
		$scope.setMonitorPins();
	};

	$scope.setMonitorPins = function() {
		var pins = [];
		angular.forEach($scope.analogPins, function(pin) {
			if(pin.monitor) pins.push(pin.value);
		});

		socket.emit('aread', { pins: pins });

		if(pins.length === 0) {
			meterdata = [];
			updateAnalogVisuals();
		}
	};

	$scope.toggleDigitalPin = function (pin, val) {
		socket.emit('dwrite', { pin: pin, val: Number(val) });
	};

}