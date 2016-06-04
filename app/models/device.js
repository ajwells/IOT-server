// app/models/device.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Service = require('./service');

var Device = new Schema({
	id: String,
	name: String,
	status: String,
	services: [{type: Schema.Types.ObjectId, ref: 'Service'}]
});

module.exports = mongoose.model('Device', Device);

