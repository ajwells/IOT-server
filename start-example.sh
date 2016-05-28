
USERNAME=username
PASSWORD=password

export DBURI=mongodb://$USERNAME:$PASSWORD@ds019033.mlab.com:19033/iot-database

node server.js
