var _ = require('underscore');

module.exports = function (express, app, db) {
    var router = express.Router();
    
    router.post('/users', function(req, res) {
        var body = _.pick(req.body, 'email', 'password');

        db.user.create(body).then(function(user) {
            res.json(user.toPublicJSON());
        }, function(e) {
            res.status(400).json(e);
        });
    });
    
    
    app.use('/', router);
}