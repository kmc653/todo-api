var _ = require('underscore');
var db = require('../db.js');
var middleware = require('../middleware.js')(db);

module.exports = function (express, app) {
	var todos = [];
	var todoNextId = 1;
	var router = express.Router();
	
	router.get('/', function (req, res) {
		res.send('Todo API Root.');
	});

	// GET /todos/:id
	router.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		
		db.todo.findOne({
			where: {
				id: todoId,
				userId: req.user.get('id')
			}
		}).then(function (todo) {
			if (!!todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}
		}, function (e) {
			res.status(500).send();
		});
	});
	
	// POST /todos
	router.post('/todos', middleware.requireAuthentication, function (req, res) {
		var body = _.pick(req.body, 'description', 'completed');
		
		db.todo.create(body).then(function (todo) {
			req.user.addTodo(todo).then(function() {
				return todo.reload();
			}).then(function(todo) {
				res.json(todo.toJSON());
			});
		}, function (e) {
			res.status(400).json(e);
		});
	});
	
	//	DELETE /todos/:id
	router.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		
		db.todo.destroy({
			where: {
				id: todoId,
				userId: req.user.get('id')
			}
		}).then(function (rowDeleted) {
			if (rowDeleted === 0) {
				res.status(404).json({
					error: 'No todo with id'
				});
			} else {
				res.status(204).send();
			}
		}, function () {
			res.status(500).send();
		});
	});
	
	//	PUT /todos/:id
	router.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		var body = _.pick(req.body, 'description', 'completed');
		var attributes = {};
		
		if(body.hasOwnProperty('completed')) {
			attributes.completed = body.completed;
		}
		
		if(body.hasOwnProperty('description')) {
			attributes.description = body.description;
		}

		db.todo.findOne({
			where: {
				id: todoId,
				userId: req.user.get('id')
			}
		}).then(function (todo) {
			if (todo) {
				todo.update(attributes).then(function (todo) {
					res.json(todo.toJSON());
				}, function (e) {
					res.status(400).send();
				});
			} else {
				res.status(404).send();
			}
		}, function () {
			res.status(500).send();
		});
	});
	
	// GET /todos?completed=true
	router.get('/todos', middleware.requireAuthentication, function (req, res) {
		var query = req.query;
		var where = {
			userId: req.user.get('id')
		};
		
		if (query.hasOwnProperty('completed') && query.completed === 'true') {
			where.completed = true;
		} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
			where.completed = false;
		}

		if (query.hasOwnProperty('q') && query.q.length > 0) {
			where.description = {
				$like: '%' + query.q + '%'
			};
		}

		db.todo.findAll({where: where}).then(function (todos) {
			res.json(todos);
		}, function (e) {
			res.status(500).send();
		});
	});
	
	app.use('/', router);
}