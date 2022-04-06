//rotas -direcionamento das requisicoes
//const { resolveObjectURL } = require('buffer');
const express = require('express');
//const req = require('express/lib/request');
//const fs = require('fs');
const routes = express.Router();
//const User = require('../schemas/user.schema');

const db = require('../connection/queries');

//relation endpoint -> function

routes.get('/users', db.getUsers);

routes.get('/users/:id', db.getUserById);

routes.post('/users', db.createUser);

routes.put('/users/:id', db.updateUser);

routes.delete('/users/:id', db.deleteUser);

module.exports = routes;
