// app/models/device.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Characteristic = require('./characteristic');

var Service = new Schema({
	name: String,
	UUID: String,
	characteristics: [{type: Schema.Types.ObjectId, ref: 'Characteristic'}]
});

module.exports = mongoose.model('Service', Service);
