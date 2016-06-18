var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var db = require('./db.js');

app.use(bodyParser.json());

require('./routes/routes.js')(express, app, db);

db.sequelize.sync().then(function() {
	app.listen(PORT, function () {
		console.log('Express listening on port ' + PORT + '!');
	});
});