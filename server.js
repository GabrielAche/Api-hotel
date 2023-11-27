// Importando módulos necessários
const express = require('express'); // Módulo Express.js para criação de aplicativos web
const { Sequelize } = require('sequelize'); // Módulo Sequelize ORM para interação com banco de dados MySQL
const cors = require('cors'); // Middleware para lidar com Compartilhamento de Recursos entre Origens (CORS)

// Criando uma instância do aplicativo Express
const app = express();

// Conectando-se ao banco de dados MySQL usando Sequelize
const sequelize = new Sequelize('hotel', 'root', 'admin', {
    dialect: 'mysql',
    host: '127.0.0.1',
    port: '3306',
});

const User = sequelize.define('User', {
    nome: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        unique: true, // Garante que o e-mail seja único
    },
    senha: Sequelize.STRING,
    token: Sequelize.STRING,
    cpf: Sequelize.STRING,
    dataNascimento: Sequelize.DATE
});

const Reserva = sequelize.define('Reserva', {
    apartamento: Sequelize.STRING,
    numHospedes: Sequelize.INTEGER,
    dataEntrada: Sequelize.DATE,
    dataSaida: Sequelize.DATE
}, {
    indexes: [
        {
            unique: true,
            fields: ['dataEntrada', 'dataSaida']
        }
    ]
});

// Sincronizando as tabelas com o banco de dados (e criando tabelas se não existirem)
sequelize.sync({ alter: true });

// Configuração de middlewares
app.use(cors()); // Permitindo Compartilhamento de Recursos entre Origens (CORS)
app.use(express.json()); // Parseando dados JSON no corpo da requisição


// Endpoint para criar um novo usuário
app.post('/users', async (req, res) => {
    const { nome, email, senha, token, cpf, dataNascimento } = req.body;

    try {
        const user = await User.create({ nome, email, senha, token, cpf, dataNascimento });
        res.json(user);
    } catch (error) {
        // Verificando se o erro é devido à violação de unicidade no campo email
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'O email já está em uso. Escolha outro email.' });
        } else {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
});



// Middleware para proteger rotas com um token secreto
app.use((req, res, next) => {
    const token = req.headers.authorization;
    if (token !== 'secret-token') {
        return res.status(401).json({ message: 'Não autorizado' });
    }
    next();
});


// Endpoint para obter todos os usuários
app.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// Endpoint para obter um usuário específico pelo ID
app.get('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({ where: { id: userId } });
    res.json(user);
});

// Endpoint para atualizar dados do usuário
app.put('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const updatedUser = req.body;
    const result = await User.update(updatedUser, { where: { id: userId } });
    res.json({ message: 'Os dados foram atualizados com sucesso!', affectedRows: result[0] });
});

// Endpoint para exclusão do usuário cadastrado
app.delete('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const result = await User.destroy({ where: { id: userId } });
    res.json({ message: 'O cadastro do cliente foi excluído com sucesso!.', affectedRows: result });
});

// Endpoint para login de usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await User.findOne({ where: { email, senha } });
        if (user) {
            res.status(200).json({ message: 'Login bem-sucedido' });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// Endpoint para obter todas as reservas
app.get('/reservas', async (req, res) => {
    const reservas = await Reserva.findAll();
    res.json(reservas);
});

// Endpoint para criar uma nova reserva
app.post('/reservas', async (req, res) => {
    const { apartamento, numHospedes, dataEntrada, dataSaida } = req.body;
    // Validando os campos, se necessário
    if (!apartamento || !numHospedes || !dataEntrada || !dataSaida) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    // Criando a reserva
    const reserva = await Reserva.create({ apartamento, numHospedes, dataEntrada, dataSaida });
    res.status(201).json({ message: 'Reserva criada com sucesso!', reserva });
});

// Endpoint para atualizar uma reserva específica
app.put('/reservas/:reservaId', async (req, res) => {
    const reservaId = req.params.reservaId;
    const updatedReserva = req.body;
    try {
        const reserva = await Reserva.findByPk(reservaId);
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }
        await Reserva.update(updatedReserva, { where: { id: reservaId } });
        res.json({ message: 'Os dados da reserva foram atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar a reserva:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar a reserva.' });
    }
});

// Endpoint para exclusão de reserva
app.delete('/reservas/:reservaId', async (req, res) => {
    const reservaId = req.params.reservaId;
    try {
        const reserva = await Reserva.findByPk(reservaId);
        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }
        await Reserva.destroy({ where: { id: reservaId } });
        res.json({ message: 'A reserva foi excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir a reserva:', error);
        res.status(500).json({ message: 'Erro interno ao excluir a reserva.' });
    }
});


// Iniciando o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000');
});