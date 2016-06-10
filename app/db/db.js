var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

function DB() {
	this.db = new sqlite3.Database('../../' + DB_NAME);
}

DB.prototype.getCharacteristics = function(callback) {
	this.db.all('SELECT * FROM characteristics', function (error, data) {
		if (error) {return callback(error);}
		callback(null, data);
	});
};

module.exports = DB;
