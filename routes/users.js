var _ = require('underscore');
var bcrypt = require('bcrypt');
var db = require('../db.js');
var middleware = require('../middleware.js')(db);


module.exports = function (express, app) {
    var router = express.Router();
    
    router.post('/users', function(req, res) {
        var body = _.pick(req.body, 'email', 'password');

        db.user.create(body).then(function(user) {
            res.json(user.toPublicJSON());
        }, function(e) {
            res.status(400).json(e);
        });
    });

    //  POST /users/login
    router.post('/users/login', function(req, res) {
        var body = _.pick(req.body, 'email', 'password');
        var userInstance;

        db.user.authenticate(body).then(function(user) {
            var token = user.generateToken('authentication');
            userInstance = user;
            
            return db.token.create({
                token: token
            });
        }).then(function(tokenInstance) {
            res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
        }).catch(function() {
            res.status(401).send();
        });
    });

    //  DELETE /users/login
    app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
        req.token.destroy().then(function () {
            res.status(204).send();
        }).catch(function () {
            res.status(500).send();
        });
    });
    
    
    app.use('/', router);
}