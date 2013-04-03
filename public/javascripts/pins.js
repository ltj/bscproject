/* ng controller for pin management */
function PinCtrl($scope) {

	// analog pins model
	$scope.analogPins = [
		{ name: 'A0', value: 0, monitor: false },
		{ name: 'A1', value: 1, monitor: false },
		{ name: 'A2', value: 2, monitor: false },
		{ name: 'A3', value: 3, monitor: false },
		{ name: 'A4', value: 4, monitor: false },
		{ name: 'A5', value: 5, monitor: false }];

	// digital pins model
	$scope.digitalPins = [
		{ name: 'D0', value: 0, input: false, toggle: false },
		{ name: 'D1', value: 1, input: false, toggle: false },
		{ name: 'D2', value: 2, input: false, toggle: false },
		{ name: 'D3', value: 3, input: false, toggle: false },
		{ name: 'D4', value: 4, input: false, toggle: false },
		{ name: 'D5', value: 5, input: false, toggle: false },
		{ name: 'D6', value: 6, input: false, toggle: false },
		{ name: 'D7', value: 7, input: false, toggle: false },
		{ name: 'D8', value: 8, input: false, toggle: false },
		{ name: 'D9', value: 9, input: false, toggle: false },
		{ name: 'D10', value: 10, input: false, toggle: false },
		{ name: 'D11', value: 11, input: false, toggle: false },
		{ name: 'D12', value: 12, input: false, toggle: false },
		{ name: 'D13', value: 13, input: false, toggle: false }];

	$scope.setMonitor = function(pin) {
		pin.monitor = ! pin.monitor;
		$scope.setMonitorPins();
	};

	$scope.setMonitorPins = function() {
		var apins = [];

		angular.forEach($scope.analogPins, function(pin) {
			if(pin.monitor) apins.push(pin.value);
		});

		socket.emit('aread', { pins: apins });

		if(apins.length === 0) {
			meterdata = [];
			updateAnalogVisuals();
		}
	};

	$scope.setDigitalReadPins = function() {
		var dpins = [];

		angular.forEach($scope.digitalPins, function(pin) {
			if(pin.input) dpins.push(pin.value);
		});

		socket.emit('dread', { pins: dpins });
	};

	$scope.toggleDigitalPin = function (pin, val) {
		socket.emit('dwrite', { pin: pin, val: Number(val) });
	};

	$scope.setPinMode = function (pin) {
		var mode = pin.input ? 0x0 : 0x1;
		socket.emit('pinmode', { pin: pin.value, mode: mode });
		$scope.setDigitalReadPins();

		// remove chart if mode changed to output
		if(!pin.input) {
			d3.select('#'+pin.name+"-chart").select('svg').remove();
		}
	};

	$scope.getToggleClass = function (pin) {
		var cls = pin.toggle ? "text-success" : "text-error";
		return cls;
	};

}