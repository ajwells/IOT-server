var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

function DB() {
	this.db = new sqlite3.Database('/home/pi/IOT-server/' + DB_NAME);
}
// Helper Functions

function addServiceChars(id, characteristics, db) {
	var promises = [];
	characteristics.forEach(function(characteristic, index) {
		var query = 'INSERT INTO has_characteristic ' +
					'(service_id, characteristic_id) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + characteristic + '\'' +
					');';
		promises.push(db.run(query, function(error) {
			if (error) {return callback(error);}
		}));
	});
	return Promise.all(promises);
};

function addDeviceServices(id, services, db) {
	var promises = [];
	services.forEach(function(service, index) {
		var query = 'INSERT INTO has_service ' +
					'(device_id, service_id) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + service + '\'' +
					');';
		promises.push(db.run(query, function(error) {
			if (error) {return callback(error);}
		}));
	});
	return Promise.all(promises);
};


// ------------------------Characteristics------------------------

DB.prototype.listCharacteristics = function(callback) {
	var query = 'SELECT * FROM characteristics';
	this.db.all(query, function (error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.newCharacteristic = function(id, name, data, callback) {
	var query = 'INSERT INTO characteristics ' +
					'(characteristic_id, characteristic_name, data) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + name + '\', ' +
						'\'' + data + '\'' +
					');';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	}.bind(this));
};

DB.prototype.updateCharacteristic = function(id, name, data, callback) {
	var query = 'UPDATE characteristics SET ';
	if (name && data) {
		query += ('characteristic_name = \'' + name + '\', data = \'' + data + '\'');
	}
	else {
		if (name) {
			query += ('characteristic_name = \'' + name + '\'');
		}
		else if (data) {
			query += ('data = \'' + data + '\'');
		}
	}
	query += (' WHERE characteristic_id = \'' + id + '\';');
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

DB.prototype.getCharacteristic = function(id, callback) {
	var query = 'SELECT * FROM characteristics WHERE characteristic_id = \'' + id + '\';';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.deleteCharacteristic = function(id, callback) {
	var query = 'DELETE FROM characteristics WHERE characteristic_id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	}.bind(this));
};

// ------------------------Services------------------------

DB.prototype.listServices = function(callback) {
	var query = 'SELECT * FROM services';
	this.db.all(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.newService = function(id, name, characteristics, callback) {
	var query = 'INSERT INTO services ' +
					'(service_id, service_name) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + name + '\'' +
					');';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		addServiceChars(id, characteristics, this.db)
			.then(function(result) {
				callback(null);
			});
	}.bind(this));
};

DB.prototype.updateService = function(id, name, characteristics, callback) {
	if (name) {
		var query = 'UPDATE services SET ' +
			'service_name = \'' + name + '\'' +
			' WHERE service_id = \'' + id + '\';';
		this.db.run(query, function(error) {
			if (error) {return callback(error);}
			addServiceChars(id, characteristics, this.db)
				.then(function(result) {
					callback(null);
				});
		}.bind(this));
	} else if (characteristics) {
		addServiceChars(id, characteristics, this.db)
			.then(function(result) {
				callback(null);
			});
	}
};

DB.prototype.getService = function(id, callback) {
	var query = 'SELECT * FROM services NATURAL JOIN has_characteristic WHERE service_id = \'' + id + '\';';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.deleteService = function(id, callback) {
	var query = 'DELETE FROM services WHERE service_id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	}.bind(this));
};

// ------------------------Devices------------------------

DB.prototype.listDevices = function(callback) {
	var query = 'SELECT * FROM devices';
	this.db.all(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.newDevice = function(id, name, services, callback) {
	var query = 'INSERT INTO devices ' +
					'(device_id, device_name, connected) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + name + '\', ' +
						'\'' + 'false' + '\'' +
					');';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		addDeviceServices(id, services, this.db)
			.then(function(result) {
				callback(null);
			});
	}.bind(this));
};

DB.prototype.updateDevice = function(id, name, connected, services, callback) {
	if (name || connected) {
		var query = 'UPDATE devices SET ';
		if (name && connected) {
			query += 'device_name = \'' + name + '\' connected = \'' + connected + '\';';
		}
		else {
			if (name) {
				query += ('device_name = \'' + name + '\'');
			} else if (connected) {
				query += ('connected = \'' + connected + '\'');
			}
		}
		query += (' WHERE device_id = \'' + id + '\';');
		this.db.run(query, function(error) {
			if (error) {return callback(error);}
			addDeviceServices(id, services, this.db)
				.then(function(result) {
					callback(null);
				});
		}.bind(this));
	} else if (services) {
		addDeviceServices(id, services, this.db)
			.then(function(result) {
				callback(null);
			});
	}
};

DB.prototype.getDevice = function(id, callback) {
	var query = 'SELECT * FROM devices NATURAL JOIN has_service WHERE device_id = \'' + id + '\';';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	}.bind(this));
};

DB.prototype.deleteDevice = function(id, callback) {
	var query = 'DELETE FROM devices WHERE device_id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	}.bind(this));
};

DB.prototype.listDeviceIDs = function(callback) {
	var query = 'SELECT device_id FROM devices;';
	this.db.all(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	});
};

// ------------------------Other------------------------

DB.prototype.getAllDeviceInfo = function() {
	return new Promise(function(resolve, reject) {
		var query = 'SELECT DISTINCT * FROM has_characteristic NATURAL JOIN has_service;';
		this.db.all(query, function(error, data) {
			if (error) {return reject(error);}
			resolve(data);
		});
	}.bind(this));
};

DB.prototype.getAll = function(device_name, service_name) {
	return new Promise(function(resolve, reject) {
		var query = 'SELECT DISTINCT * FROM devices NATURAL JOIN services NATURAL JOIN characteristics NATURAL JOIN has_characteristic NATURAL JOIN has_service ' + 
					'WHERE device_name = \'' + device_name + '\' AND service_name = \'' + service_name + '\';';
		this.db.get(query, function(error, data) {
			if (error) {return reject(error);}
			resolve(data);
		});
	}.bind(this));
};

module.exports = DB;
