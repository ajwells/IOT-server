var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

function DB() {
	this.db = new sqlite3.Database(DB_NAME);
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
	});
};

DB.prototype.newCharacteristic = function(id, name, data, callback) {
	var query = 'INSERT INTO characteristics ' +
					'(id, name, data) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + name + '\', ' +
						'\'' + data + '\'' +
					');';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

DB.prototype.updateCharacteristic = function(id, name, data, callback) {
	var query = 'UPDATE characteristics SET ';
	if (name && data) {
		query += ('name = \'' + name + '\', data = \'' + data + '\'');
	}
	else {
		if (name) {
			query += ('name = \'' + name + '\'');
		}
		else if (data) {
			query += ('data = \'' + data + '\'');
		}
	}
	query += (' WHERE id = \'' + id + '\';');
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

DB.prototype.getCharacteristic = function(id, callback) {
	var query = 'SELECT * FROM characteristics WHERE id = \'' + id + '\';';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	});
};

DB.prototype.deleteCharacteristic = function(id, callback) {
	var query = 'DELETE FROM characteristics WHERE id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

// ------------------------Services------------------------

DB.prototype.listServices = function(callback) {
	var query = 'SELECT * FROM services';
	this.db.all(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	});
};

DB.prototype.newService = function(id, name, characteristics, callback) {
	var query = 'INSERT INTO services ' +
					'(id, name) ' +
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
			'name = \'' + name + '\'' +
			' WHERE id = \'' + id + '\';';
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
	var query = 'SELECT * FROM services, has_characteristic WHERE id = \'' + id + '\' and id = service_id;';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	});
};

DB.prototype.deleteService = function(id, callback) {
	var query = 'DELETE FROM services WHERE id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

// ------------------------Devices------------------------

DB.prototype.listDevices = function(callback) {
	var query = 'SELECT * FROM devices';
	this.db.all(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	});
};

DB.prototype.newDevice = function(id, name, services, callback) {
	var query = 'INSERT INTO devices ' +
					'(id, name, connected) ' +
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
			query += 'name = \'' + name + '\' connected = \'' + connected + '\';';
		}
		else {
			if (name) {
				query += ('name = \'' + name + '\'');
			} else if (connected) {
				query += ('connected = \'' + connected + '\'');
			}
		}
		query += (' WHERE id = \'' + id + '\';');
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
	var query = 'SELECT * FROM devices, has_service WHERE id = \'' + id + '\' and id = device_id;';
	this.db.get(query, function (error, data) {
		if (error) {callback(error);}
		callback(null, data);
	});
};

DB.prototype.deleteDevice = function(id, callback) {
	var query = 'DELETE FROM devices WHERE id = \'' + id + '\';';
	this.db.run(query, function(error) {
		if (error) {return callback(error);}
		callback(null);
	});
};

module.exports = DB;
