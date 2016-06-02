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
			});
			promises.push(connect(peripheral));
		});
		return Promise.all(promises);
};

discoverList = ['EC:44:71:02:29:55'];

	discover(discoverList)
	.then(connectAll)
	.then(function(results) {
		/*results.forEach(function(peripheral) {
			peripheral.discoverSomeServicesAndCharacteristics(
			['0dbb9a2d39de45908eacbfdef650416f'],
			['3c66211138f84a8ebdd61e0a5f403277'],
			function(error, services, characteristics) {
				characteristics[0].read(function(error, data) {
					if (error) {
						console.log(error);
					} else {
						console.log(data.toString());
					}
				});
			});
		});*/
	});


	
