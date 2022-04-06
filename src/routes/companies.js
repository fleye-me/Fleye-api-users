//rotas -direcionamento das requisicoes
const express = require('express')
const req = require('express/lib/request')
const fs = require('fs')
const routes = express.Router()
const Company = require('../schemas/company.schema')
                

// Reading data
let rawcompanies = fs.readFileSync('data/companies.json', 'utf8')
var data = JSON.parse(rawcompanies)
const { companies } = data //tipar fica mais seguro

//GET simples, retorna td dados
routes.get('/companies', (req, res) => {
    return res.json(companies)
})

//GET com opção de filtrar pelo id direto na url
routes.get('/companies/:id', (req, res) => { //buscar dados
    const id = parseInt(req.params.id)
    const u = companies.find(item => item.id === id);

    return console.log(u)? res.json(u) : res.status(400).send("Invalid id") 
})


/*
//definir um get com filtros mais gerais
routes.get('companies/:id', (req, res) => { //buscar dados

    //para todos os parametros de req.params
    //const filter = { name^122 , idadeÇ 412}

    // if(req.params.name){
    //     for(let chave of chaves) {
    //         companies[chave[-1]]
    //     }
    //     user.name
    //     companies["name"]
    //     const companiesFound = companies.find((user) => user[req.params.name] === req.params.name)
    //     return res.json(companiesFound);
})
*/

routes.post('/companies', (req, res) =>{ //inserir dados
    const newCompany = req.body //body contem tds os dados q precisar que foram passados pelo "body" (json) do navegador
    let user = data.companies
    console.log(newCompany)
    if(!newCompany?.id) return res.status(400).send('id mandatory') //caso body nao exista informa p usuario q precisa passar algo
    for(let u of user){ //caso usuario com esse id jah exista -> fazer uma funcao que retorna tds ids (util em mais lugares)
        if (u.id === newCompany.id)
            return res.status(400).send('This id already exists')
    }

    data.companies.push(newCompany) //colocando na variavel os dados novos
    
    var newData = JSON.stringify(data); //salvando o novo dado no arquivo
    fs.writeFile('data/companies.json', newData, err => {
        if(err) throw err;
    }); 

    return res.json(newCompany) 
    
    //    foi necessário alterar o header do Postman,
    //    desmarcar Content-Type e criar Conten-Type application/json
    //    por algum motivo nao permitia editar
    
})

routes.delete('/companies/:id', (req, res) => {//id eh um parâmetro passado pela url
    const id = parseInt(req.params.id)
    let newcompanies = companies.filter(user => {return user.id !== id })
    
    data.companies = newcompanies //altera o banco de dados
    
    var newData = JSON.stringify(data); //salvando o novo dado no arquivo
    fs.writeFile('data/companies.json', newData, err => {
        if(err) throw err;
    }); 

    return res.send(newcompanies)
})

routes.put('/companies/:id', (req, res) => { //atualização de usuário, envia todos os dados p atualizar 1 ou mais campos 
    const user = req.body
    

    //use find
    for(let u of companies){
        if (u.id === user.id){ //eh preciso que o usuario exista
            console.log(typeof keys)
            Object.entries(user).forEach(([key, value]) => {
                console.log(keys)
                console.log(key)
                console.log(keys.includes(key))
                if (Company[key] !== '') {
                    return res.status(400).send(`The allowed information are: ${keys}`).end();
                    //mesmo depois de cair nesse return ainda altera as informações do usuário (linha 100)
                }
            }) 

            Object.entries(user).forEach(([key, value]) => {
                u[key] = value
            })
            var newData = JSON.stringify(data);
            fs.writeFile('data/companies.json', newData, err => {
                if(err) throw err;
            })
            return res.status(200).send('Company updated')
        }
    }
    
    return res.status(400).send('Company does not exist, can not alter it')
    
})

routes.patch('/companies', (req, res) => { //atualiza soh parte do recurso
    const user = req.body
    for(let u of companies){
        if (u.id === user.id){
            Object.entries(user).forEach(([key, value]) => {
                u[key] = value
            }) 
            var newData = JSON.stringify(data);
            fs.writeFile('data/companies.json', newData, err => {
                if(err) throw err;
            })

            return res.send('Company updated')
        }
    }
})

module.exports = routes