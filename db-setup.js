#!/usr/bin/env node

var sqlite3 = require('sqlite3');

var DB_NAME = 'IOT-DB.db';

var db = new sqlite3.Database(DB_NAME);

db.run('CREATE TABLE devices (id character NOT NULL PRIMARY KEY, name varchar NOT NULL, connected boolean NOT NULL);');
db.run('CREATE TABLE services (id character NOT NULL PRIMARY KEY, name varchar NOT NULL);');
db.run('CREATE TABLE characteristics (id character NOT NULL PRIMARY KEY, name varchar NOT NULL, data varchar);');

db.run('CREATE TABLE has_service (device_id character NOT NULL, service_id character NOT NULL, FOREIGN KEY(device_id) REFERENCES devices(id), FOREIGN KEY(service_id) REFERENCES services(id));');
db.run('CREATE TABLE has_characteristic (service_id character NOT NULL, characteristic_id character NOT NULL, FOREIGN KEY(service_id) REFERENCES services(id), FOREIGN KEY(characteristic_id) REFERENCES characteristics(id));');
