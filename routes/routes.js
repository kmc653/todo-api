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
		var matchedTodo;

		// Iterate of todos array. Find the match
		todos.forEach(function (todo) {
			if(todo.id === todoId){
				matchedTodo = todo;
			}
		});

		if(matchedTodo) {
			res.json(matchedTodo);
		} else {
			res.status(404).send();
		}
	});
	
	// POST /todos
	router.post('/todos', function (req, res) {
		var body = req.body;
		
		// Add id field
		body.id = todoNextId++;
		
		// Push body into array
		if(typeof body.description === "string" && typeof body.completed === "boolean") {
			todos.push(body);
			res.json(body);
		} else {
			res.status(400).send();
		}
	});
	
	app.use('/', router);
}