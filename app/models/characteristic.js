// app/models/device.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Characteristic = new Schema({
	name: String,
	UUID: String,
	data: String
});

module.exports = mongoose.model('Characteristic', Characteristic);

