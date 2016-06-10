var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

function DB() {
	this.db = new sqlite3.Database(DB_NAME);
}

DB.prototype.getCharacteristics = function(callback) {
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
	this.db.run(query, function(error, data) {
		if (error) {return callback(error);}
		callback(null);
	});
};

module.exports = DB;
