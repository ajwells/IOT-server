#!/usr/bin/env node
// server.js

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.port || 8080;

// DB SETUP
// ----------------------------------

var db = require('./app/src/db');
var DB = new db();

// BLUETOOTH
// ----------------------------------

var bt = require('./app/src/bluetooth');
var BT = new bt();
DB.listDeviceIDs(function(err, discoverList) {
	if (err) {console.log(err);}
	discoverList = discoverList.map(function(curVal) {
		return curVal.id;
	});
	BT.discover(discoverList)
		.then(BT.connectAll)
		.then(function(results) {
			DB.getAllDeviceInfo()
				.then(function(device_info) {
					results.forEach(function(peripheral, index) {
						device_info.forEach(function(device, index) {
							if (device.device_id.toLowerCase() == peripheral.address) {
								BT.readChar(peripheral, device.service_id, device.characteristic_id)
									.then(function(data) {
										console.log(data.toString());
										DB.updateCharacteristic(device.characteristic_id, null, data.toString(), function(err) {
											if (err) {console.log(err);}
										});
									});
							}
						});
					});
				}.bind(this));
		});
});

// ROUTES FOR API
// ----------------------------------
var router = express.Router();

router.use(function(req, res, next) {
	console.log('API accessed');
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'wassup' });
});

// device routes
// ----------------------------------

// all devices
router.route('/devices')
	// new device
	.post(function(req, res) {
		DB.newDevice(req.body.id, req.body.name, JSON.parse(req.body.services), function(err) {
			if (err) {res.send(err);}
			else {res.json({ message: 'device created' });}
		});
	})
	
	// list all devices
	.get(function(req, res) {
		DB.listDevices(function(err, devices) {
			if (err) {res.send(err);}
			else {res.json(devices);}
		});
	});

// device by id
router.route('/devices/:id')

	// list device
	.get(function(req, res) {
		DB.getDevice(req.params.id, function(err, device) {
			if (err) {res.send(err);}
			else {res.json(device);}
		});
	})

	// update device
	.put(function(req, res) {
		DB.updateDevice(req.params.id, req.body.name, req.body.connected, function(err) {
			if (err) { res.send(err); }
			else {res.json({ message: 'device updated' });}
		});
	})

	//delete device
	.delete(function(req, res) {
		DB.deleteDevice(req.params.id, function(err) {
			if (err) {res.send(err);}
			else {res.json({ message: 'deleted device' });}
		});
	});

// service routes
// ----------------------------------

// all services
router.route('/services')
	// new device
	.post(function(req, res) {
		DB.newService(req.body.id, req.body.name, JSON.parse(req.body.characteristics), function(err) {
			if (err) {res.send(err);}
			else {res.json({ message: 'service created' });}
		});
	})
	
	// list all services
	.get(function(req, res) {
		DB.listServices(function(err, services) {
			if (err) {res.send(err);}
			else {res.json(services);}
		});
	});

// service by id
router.route('/services/:id')

	// list service
	.get(function(req, res) {
		DB.getService(req.params.id, function(err, service) {
			if (err) {res.send(err);}
			else {res.json(service);}
		});
	})

	// update service
	.put(function(req, res) {
		DB.updateService(req.params.id, req.params.name, JSON.parse(req.body,characteristics), function(err) {
			if (err) { res.send(err); }
			else {res.json({ message: 'service updated' });}
		});
	})

	//delete service
	.delete(function(req, res) {
		DB.deleteService(req.params.id, function(err) {
			if (err) {res.send(err);}
			else {res.json({ message: 'deleted service' });}
		});
	});

// characteristic routes
// ----------------------------------

// all characteristics
router.route('/characteristics')
	// new characteristic
	.post(function(req, res) {
		DB.newCharacteristic(req.body.id, req.body.name, req.body.data, function(err) {
			if (err) {res.send(err);}
			else {res.json({ message: 'characteristic created' });}
		});
	})
	
	// list all characteristics 
	.get(function(req, res) {
		DB.listCharacteristics(function (err, characteristics) {
			if (err) {res.send(err);}
			else {res.json(characteristics);}
		});
	});

// characteristics by id
router.route('/characteristics/:id')

	// list characteristics  
	.get(function(req, res) {
		DB.getCharacteristic(req.params.id, function(err, characteristic) {
			if (err) {res.send(err);}
			else {res.json(characteristic);}
		});
	})

	// update characteristics 
	.put(function(req, res) {
		DB.updateCharacteristic(req.params.id, req.body.name, req.body.data, function(err) {
			if (err) { res.send(err); }
			else {res.json({ message: 'service updated' });}
		});
	})

	//delete characteristics  
	.delete(function(req, res) {
		DB.deleteCharacteristic(req.body.id, function(err, characteristic) {
			if (err) {res.send(err);}
			else {res.json({ message: 'deleted characteristic' });}
		});
	});

// bluetooth routes
// ----------------------------------

// REGISTER ROUTES AND START SERVER
// ----------------------------------
app.use('/api', router);

app.listen(PORT, function () {
	console.log('server listening on port: ' + PORT);
});

