const express = require('express');
const routes = express.Router();
const userService = require('../service/user.service');

//relation endpoint -> function

routes.get('/users', userService.getUsers);

routes.get('/users/count/', userService.countAllUsers); //order matters, needs to be before /users/:id (data)

routes.get('/users/:id', userService.getUserById);

routes.post('/users', userService.createUser);

routes.put('/users/:id', userService.updateUser);

routes.delete('/users/:id', userService.deleteUser);

routes.patch('/users/:id', userService.updateUserPartially);

module.exports = routes;

//can improve: https://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router/25305272#25305272
