const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json())

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
      const user = users.find(user => user.username === username);
      if(!user) {
        return response.status(400).json({error: 'User not found'})
      }

      request.user = user;
      return next();
}

app.post('/users', (request, response) => {
  const {name} = request.body;
  const {username} = request.headers;
  const id = uuidv4();

  const userExists = users.find(user => user.username === username );

  if(userExists) {
      return response.status(400).json({error : 'Username already exists'});
  } else {
      users.push({
        id,
        name,
        username,
        todos: []
      });

      response.status(201).json({ error: false, data: users });
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 const { user } = request;
 return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { title,deadline } = request.body;
  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.ush(todo);
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { title, deadline } = request.body;
  const {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error : "Todo not exists"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error : "Todo not exists"})
  }


  todo.done = true;
  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoIndex = user.todos.Index(todo => todo.id === id);
  if(todoIndex === -1) {
    return response.status(404).json({error : "Todo not exists"});
  }

  user.todos.splice(todoIndex, 1);
  response.status(204).json()
});

module.exports = app;