require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const rotasAuth = require('./routes/auth');
const rotasProdutos = require('./routes/produtos');
const rotasMarcas = require('./routes/marcas');
const rotasUsuarios = require('./routes/usuarios');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { 
        maxAge: 8 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        console.log(`[${req.method}] ${req.path} | session ID: ${req.sessionID} | usuario: ${JSON.stringify(req.session.usuario)}`);
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', rotasAuth);
app.use('/api/produtos', rotasProdutos);
app.use('/api/marcas', rotasMarcas);
app.use('/api/usuarios', rotasUsuarios);

app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ erro: 'Rota não encontrada' });
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));