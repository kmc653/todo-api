var _ = require('underscore');

module.exports = function (express, app) {
	var todos = [];
	var todoNextId = 1;
	var router = express.Router();
	
	router.get('/', function (req, res) {
		res.send('Todo API Root.');
	});
	
	// GET /todos
	router.get('/todos', function (req, res) {
		res.json(todos);
	});

	// GET /todos/:id
	router.get('/todos/:id', function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		var matchedTodo = _.findWhere(todos, {id: todoId});

		if(matchedTodo) {
			res.json(matchedTodo);
		} else {
			res.status(404).send();
		}
	});
	
	// POST /todos
	router.post('/todos', function (req, res) {
		var body = _.pick(req.body, 'description', 'completed');
		
		// Make filter
		if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
			return res.status(400).send();
		}
		
		body.description = body.description.trim();
		
		// Add id field
		body.id = todoNextId++;
		
		// Push body into array
		todos.push(body);
		res.json(body);
	});
	
	//	DELETE /todos/:id
	router.delete('/todos/:id', function (req, res) {
		var todoId = parseInt(req.params.id, 10);
		var matchedTodo = _.findWhere(todos, {id: todoId});
		
		if(matchedTodo) {
			todos = _.without(todos, matchedTodo);
			res.json(matchedTodo);
		} else {
			res.status(404).json({"error": "no todo found with that id"});
		}
	});
	
	app.use('/', router);
}