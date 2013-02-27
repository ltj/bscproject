/* ng controller for pin management */
function PinCtrl($scope) {

	$scope.analogPins = [
		{name: 'A0', value: 0, monitor: false},
		{name: 'A1', value: 1, monitor: false},
		{name: 'A2', value: 2, monitor: false},
		{name: 'A3', value: 3, monitor: false},
		{name: 'A4', value: 4, monitor: false},
		{name: 'A5', value: 5, monitor: false}];

	$scope.setMonitorPins = function() {
		var pins = [];
		angular.forEach($scope.analogPins, function(pin) {
			if(pin.monitor) pins.push(pin.value);
		});

		socket.emit('amonitor', { pins: pins });
		console.log({ pins: pins });

		if(pins.length === 0) {
			meterdata = [];
			updateMeters();
		}
		
	};
}