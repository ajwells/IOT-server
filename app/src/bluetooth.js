var noble = require('noble');


noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning();
	} else {
		noble.stopScanning();
	}
});

function discover(discoverList, timeout = 5000) {
	return new Promise(function(resolve, reject) {
		var devices = [];
		noble.on('discover', function(peripheral) {
			console.log('Discovered: ' + peripheral.advertisement.localName +
				' (' + peripheral.address.toUpperCase() + ')');
			if (discoverList.indexOf(peripheral.address.toUpperCase()) >= 0) {
				devices.push(peripheral);
			}
		});
		setTimeout(function() {
			noble.stopScanning();
			resolve(devices);
		}, timeout);
	});
};

function discoverAllServices(peripheral) {
	return new Promise(function(resolve, reject) {
		peripheral.discoverServices([], function(error, services) {
			resolve(services);
		});
	});
};

function connect(peripheral) {
	return new Promise(function(resolve, reject) {
		peripheral.connect(function(error) {
			if (error) {
				reject(error);
			}
			console.log('Connected to: ' + peripheral.advertisement.localName);
			discoverAllServices(peripheral).then(function() {
				resolve(peripheral);
			});
		});
	});
};

function connectAll(devices) {
	var connectedDevices = [];
	var promises = [];
	devices.forEach(function(peripheral, index) {
		peripheral.on('disconnect', function() {
			console.log(peripheral.advertisement.localName + ' disconnected');
			connect(peripheral).then(function(peripheral) {
				console.log('device reconnected');
			});
		});
		promises.push(connect(peripheral));
	});
	return Promise.all(promises);
};

function readChar(peripheral, serviceUUID, charUUID) {
	return new Promise(function(resolve, reject) {
		peripheral.discoverSomeServicesAndCharacteristics([serviceUUID], [charUUID],
			function(error, services, characteristics) {
				characteristics[0].read(function(error, data) {
					if (error) {
						reject(error);
					} else {
						resolve(data);
					}
				});
		});
	});
};

function writeChar(peripheral, serviceUUID, charUUID, data, withoutResponse) {
	return new Promise(function(resolve, reject) {
		peripheral.discoverSomeServicesAndCharacteristics([serviceUUID], [charUUID],
			function(error, services, characteristics) {
				var buf = new Buffer(data, 'utf-8');
				characteristics[0].write(buf, false, function(error) {
					if (error) {
						reject(error);
					} 
					console.log('write done');
					resolve('ok');
				});
		});
	});
};

function notifyChar(peripheral, serviceUUID, charUUID) {
	return new Promise(function(resolve, reject) {
		peripheral.discoverSomeServicesAndCharacteristics([serviceUUID], [charUUID],
			function(error, services, characteristics) {
				characteristics[0].notify(true, function(error) {
					if (error) {
						reject(error);
					} 
					characteristics[0].on('data', function(data, isNotification) {
						console.log(data.toString());
					});
					console.log('subscribed');
					resolve('ok');
				});
		});
	});
};


var discoverList = ['EC:44:71:02:29:55'];
var serviceUUID = '0dbb9a2d39de45908eacbfdef650416f';
var charUUID = '3c66211138f84a8ebdd61e0a5f403277';
var connectedList = [];
var serviceUUID2 = 'a3aa7ef1fc73424a83a85c99a905a4d3';
var charUUID2 = 'b49b1d222ca7448bb98a1185c5328553';

discover(discoverList)
	.then(connectAll)
	.then(function(results) {
		connectedList = results;
		results.forEach(function(peripheral) {
			readChar(peripheral, serviceUUID, charUUID).then(function(data) {
				console.log(data.toString());
				writeChar(peripheral, serviceUUID2, charUUID2, 'ON', false).then(function(ok) {
					console.log(ok);
					readChar(peripheral, serviceUUID2, charUUID2).then(function(data) {
						console.log(data.toString());
						notifyChar(peripheral, serviceUUID2, charUUID2).then(function(ok) {
							console.log(ok);
						});
					});
				});
			});
		});
	});


	
