var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

function DB() {
	this.db = new sqlite3.Database(DB_NAME);
}

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
	});

	characteristics.forEach(function(characteristic, index) {
		var query = 'INSERT INTO has_characteristic ' +
					'(service_id, characteristic_id) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + characteristic + '\'' +
					');';
		this.db.run(query, function(error) {
			if (error) {return callback(error);}
		});
	}.bind(this));

	callback(null);
};

DB.prototype.updateService = function(id, name, characteristics, callback) {
	if (name) {
		var query = 'UPDATE services SET ' +
			'name = \'' + name + '\'' +
			' WHERE id = \'' + id + '\';');
		this.db.run(query, function(error) {
			if (error) {return callback(error);}
		});
	}

	characteristics.forEach(function(characteristic, index) {
		var query = 'INSERT INTO has_characteristic ' +
					'(service_id, characteristic_id) ' +
					'VALUES (' +
						'\'' + id + '\', ' +
						'\'' + characteristic + '\'' +
					');';
		this.db.run(query, function(error) {
			if (error) {return callback(error);}
		});
	}.bind(this));

	callback(null);
};

DB.prototype.getService = function(id, callback) {
	var query = 'SELECT * FROM services WHERE id = \'' + id + '\';';
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

module.exports = DB;
