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

var db = require('./app/db/db');
var DB = new db();


// ROUTES FOR API
// ----------------------------------
var router = express.Router();

router.use(function(req, res, next) {
	console.log('API accessed');
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'hello' });
});

// device routes
// ----------------------------------

// all devices
router.route('/devices')
	// new device
	.post(function(req, res) {
		var device = new Device();
		device.name = req.body.name;
		device.status = req.body.status;
		device.save(function(err) {
			if (err) {res.send(err);}
			res.json({ message: 'device created' });
		});
	})
	
	// list all devices
	.get(function(req, res) {
		Device.find(function(err, devices) {
			if (err) {res.send(err);}
			res.json(devices);
		});
	});

// device by id
router.route('/devices/:id')

	// list device
	.get(function(req, res) {
		Device.findById(req.params.id, function(err, device) {
			if (err) {res.send(err);}
			res.json(device);
		});
	})

	// update device
	.put(function(req, res) {
		Device.findById(req.params.id, function(err, device) {
			if (err) { res.send(err); }
			
			device.name = req.body.name;
			device.status = req.body.status;
			device.save(function(err) {
				if (err) { res.send(err); }
				res.json({ message: 'device updated' });
			});
		});
	})

	//delete device
	.delete(function(req, res) {
		Device.remove({
			_id: req.params.id
		}, function(err, device) {
			if (err) {res.send(err);}
			res.json({ message: 'deleted device' });
		});
	});

// service routes
// ----------------------------------

// all services
router.route('/services')
	// new device
	.post(function(req, res) {
		var service = new Service();
		service.name = req.body.name;
		service._id = req.body._id;
		var characteristics = JSON.parse(req.body.characteristics);
		console.log(typeof characteristics);
		service.characteristics = [];
		characteristics.forEach(function(item, index) {
			Characteristic.findById(item, function(err, characteristic) {
				if (err) {res.send(err);}
				console.log(characteristic._id);
				service.characteristics.push(characteristic._id);
			});
		});
		service.save(function(err) {
			if (err) {res.send(err);}
			Service.find({})
				.populate('characteristics')
				.exec(function(error, services) {
					console.log(JSON.stringify(services, null, '\t'));
				});
			res.json({ message: 'service created' });
		});
	})
	
	// list all services
	.get(function(req, res) {
		Service.find(function(err, services) {
			if (err) {res.send(err);}
			res.json(services);
		});
	});

// service by id
router.route('/services/:id')

	// list service
	.get(function(req, res) {
		Service.findById(req.params.id, function(err, service) {
			if (err) {res.send(err);}
			res.json(service);
		});
	})

	// update service
	.put(function(req, res) {
		Service.findById(req.params.id, function(err, service) {
			if (err) { res.send(err); }
			
			service.name = req.body.name;
			service.save(function(err) {
				if (err) { res.send(err); }
				res.json({ message: 'service updated' });
			});
		});
	})

	//delete service
	.delete(function(req, res) {
		Service.remove({
			_id: req.params.id
		}, function(err, service) {
			if (err) {res.send(err);}
			res.json({ message: 'deleted service' });
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
			res.json({ message: 'characteristic created' });
		});
	})
	
	// list all characteristics 
	.get(function(req, res) {
		DB.getCharacteristics(function (err, characteristics) {
			if (err) {res.send(err);}
			res.json(characteristics);
		});
	});

// characteristics by id
router.route('/characteristics/:id')

	// list characteristics  
	.get(function(req, res) {
		Characteristic.findById(req.params.id, function(err, characteristic) {
			if (err) {res.send(err);}
			res.json(characteristic);
		});
	})

	// update characteristics 
	.put(function(req, res) {
		Characteristic.findById(req.params.id, function(err, characteristic) {
			if (err) { res.send(err); }
			characteristic.name = req.body.name;
			characteristic.save(function(err) {
				if (err) { res.send(err); }
				res.json({ message: 'service updated' });
			});
		});
	})

	//delete characteristics  
	.delete(function(req, res) {
		Characteristic.remove({
			_id: req.params.id
		}, function(err, characteristic) {
			if (err) {res.send(err);}
			res.json({ message: 'deleted characteristic' });
		});
	});

// REGISTER ROUTES AND START SERVER
// ----------------------------------
app.use('/api', router);

app.listen(PORT, function () {
	console.log('server listening on port: ' + PORT);
});

