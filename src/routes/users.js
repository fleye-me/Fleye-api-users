//rotas -direcionamento das requisicoes
const { resolveObjectURL } = require('buffer');
const express = require('express');
const req = require('express/lib/request');
const fs = require('fs');
const routes = express.Router();
const User = require('../schemas/user.schema');
const {
    initQuery,
    executeFilters,
    organizeData,
} = require('../common/query-helper'); //only uses these functions

// Reading data
let rawUsers = fs.readFileSync('data/users.json', 'utf8');
var data = JSON.parse(rawUsers);
const { users } = data; //tipar fica mais seguro

//GET simples, retorna td dados
routes.get('/users', (req, res) => {
    return res.json(users);
});

routes.get('/user', (req, res) => {
    query = initQuery(req.query, users);
    //transforma query em select
    let newUsers = organizeData(query, users);
    //executa select
    let output = executeFilters(query, newUsers);

    return res.json(output);
});

routes.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const u = users.find((item) => item.id === id); //se nao encontrar nenhum obj retorna nulo, nao obj vazio {} que eh falso

    return u ? res.json(u) : res.status(400).send('Invalid id'); //cuidar qnd id=0, pois 0 eh falso
});

routes.post('/users', (req, res) => {
    //inserir dados
    const newUser = req.body; //body contem tds os dados q precisar que foram passados pelo "body" (json) do navegador

    if (Object.keys(newUser).length === 0)
        return res.status(400).send('need user information'); //caso body nao exista informa p usuario q precisa passar algo

    //verificar se campos do request são validos
    for (let i of Object.entries(newUser)) {
        if (User[i[0]] !== '')
            return res.status(400).send(`${i[0]} is not valid`);
    }

    const newId = users.length + 1;
    newUser['id'] = newId;

    data.users.push(newUser); //colocando na variavel os dados novos
    saveData(data);

    return res.json(newUser);
});

routes.delete('/users/:id', (req, res) => {
    //id eh um parâmetro passado pela url
    const id = parseInt(req.params.id);
    let newUsers = users.filter((user) => {
        return user.id !== id;
    });

    if (Object.keys(users).length === Object.keys(newUsers).length)
        return res.status(400).send('Id does not exist');

    data.users = newUsers; //altera o banco de dados
    saveData(data);

    return res.send(newUsers);
});

routes.put('/users/:id', (req, res) => {
    //atualização de usuário, envia todos os dados p atualizar 1 ou mais campos
    const id = parseInt(req.params.id);
    const user = req.body;

    for (let u of users) {
        if (u.id === id) {
            //eh preciso que o usuario exista
            for (let i of Object.entries(user)) {
                if (User[i[0]] !== '')
                    return res.status(400).send(`${i[0]} is not valid`);
            }
            Object.entries(user).forEach(([key, value]) => {
                u[key] = value;
            });

            saveData(data);
            return res.status(200).send('User updated');
        }
    }

    return res.status(400).send('User does not exist, can not alter it');
});

routes.patch('/users/:id', (req, res) => {
    //atualiza soh parte do recurso
    const id = parseInt(req.params.id);
    const user = req.body;

    for (let i of Object.entries(user)) {
        //verifica se os campos informados sao validos
        if (User[i[0]] !== '')
            return res.status(400).send(`${i[0]} is not valid`);
    }

    for (let u of users) {
        if (u.id === id) {
            Object.entries(user).forEach(([key, value]) => {
                u[key] = value;
            });

            saveData(data);
            return res.send('User updated');
        }
    }
});

function saveData(data) {
    var newData = JSON.stringify(data); //salvando o novo dado no arquivo
    fs.writeFile('data/users.json', newData, (err) => {
        if (err) throw err;
    });
}

module.exports = routes;
