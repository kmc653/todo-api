var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var db = require('./db.js');

app.use(bodyParser.json());

require('./routes/routes.js')(express, app);
require('./routes/users.js')(express, app);

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function () {
		console.log('Express listening on port ' + PORT + '!');
	});
});