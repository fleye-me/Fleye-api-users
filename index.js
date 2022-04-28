//servidor
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./src/routes/index');

const app = express();

app.use(morgan('dev')); //para ter td log de execucao
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); //determina o tipo de dados que quer receber (json)
app.use(cors()); //vazio pq vai ser localhost
app.use(routes.users);
//app.use(routes.companies);

//abrindo servidor
app.listen(3000, () => {
  console.log(`Express started at http://localhost:3000`);

  //    client.connect();
});
