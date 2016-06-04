// server.js


var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var PORT = process.env.port || 8080;

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

// REGISTER ROUTES AND START SERVER
// ----------------------------------
app.use('/api', router);

app.listen(PORT, function () {
	console.log('server listening on port: ' + PORT);
});

// DB SETUP
// ----------------------------------
var mongoose = require('mongoose');
mongoose.connect(process.env.DBURI);

var Device = require('./app/models/device');
var Service = require('./app/models/service');
var Characteristic = require('./app/models/characteristic');

