//rotas -direcionamento das requisicoes
//const { resolveObjectURL } = require('buffer');
const express = require('express');
//const req = require('express/lib/request');
//const fs = require('fs');
const routes = express.Router();
//const User = require('../schemas/user.schema');

const userCRUD = require('../connection/userCRUD');

//relation endpoint -> function

routes.get('/users', userCRUD.getUsers);

routes.get('/users/count/', userCRUD.countAllUsers); //order matters, needs to be before /users/:id (data)

routes.get('/users/:id', userCRUD.getUserById);

routes.post('/users', userCRUD.createUser);

routes.put('/users/:id', userCRUD.updateUser);

routes.delete('/users/:id', userCRUD.deleteUser);

routes.patch('/users/:id', userCRUD.updateUserPartially);

module.exports = routes;

//can improve: https://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router/25305272#25305272
