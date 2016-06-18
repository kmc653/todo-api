var _ = require('underscore');

module.exports = function (express, app, db) {
	var todos = [];
	var todoNextId = 1;
	var router = express.Router();
	
	router.get('/', function (req, res) {
		res.send('Todo API Root.');
	});

	// GET /todos/:id
	router.get('/todos/:id', function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		
		db.todo.findById(todoId).then(function (todo) {
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
	router.post('/todos', function (req, res) {
		var body = _.pick(req.body, 'description', 'completed');
		
		db.todo.create(body).then(function (todo) {
			res.json(todo.toJSON());
		}, function (e) {
			res.status(400).json(e);
		});
	});
	
	//	DELETE /todos/:id
	router.delete('/todos/:id', function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		
		db.todo.destroy({
			where: {
				id: todoId
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
		// var matchedTodo = _.findWhere(todos, {id: todoId});
		
		// if(matchedTodo) {
		// 	todos = _.without(todos, matchedTodo);
		// 	res.json(matchedTodo);
		// } else {
		// 	res.status(404).json({"error": "no todo found with that id"});
		// }
	});
	
	//	PUT /todos/:id
	router.put('/todos/:id', function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		var matchedTodo = _.findWhere(todos, {id: todoId});
		var body = _.pick(req.body, 'description', 'completed');
		var validAttributes = {};
		
		if(!matchedTodo) {
			return res.status(404).send();
		}
		
		if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
			validAttributes.completed = body.completed;
		} else if (body.hasOwnProperty('completed')) {
			return res.status(400).send();
		}
		
		if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
			validAttributes.description = body.description;
		} else if(body.hasOwnProperty('description')) {
			return res.status(400).send();

		}
		
		res.json(_.extend(matchedTodo, validAttributes));
	});
	
	// GET /todos?completed=true
	router.get('/todos', function (req, res) {
		var query = req.query;
		var where = {};
		
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