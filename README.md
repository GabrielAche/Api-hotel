# Api-hotel
Api-hotel
Para começar a api, é preciso usar esses comandos no terminal:
  - npm install express
  - node server.js
    
Também é necessário configurar o banco de dados no script server.js, conforme o exemplo abaixo.

// Conectando-se ao banco de dados MySQL usando Sequelize
const sequelize = new Sequelize('nome_do_banco_de_dados', 'usuario_do_banco_de_dados', 'senha_do_banco_de_dados', {
    dialect: 'mysql', // definir o tipo de banco de dados
    host: '127.0.0.1', // onde está o banco de dados
    port: '3306', // definir a porta do banco de dados
});

OBS: caso não tenha senha no banco de dados, pode deixar o campo vazio entre aspas simples ''
