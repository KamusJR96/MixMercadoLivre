const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db/conexao');

router.get('/eu', (req, res) => {
    console.log('[/eu] sessionID:', req.sessionID, '| usuario:', req.session.usuario);
    if (req.session.usuario) return res.json(req.session.usuario);
    res.status(401).json({ erro: 'Não autenticado' });
});

router.post('/login', async (req, res) => {
    const { username, senha } = req.body;
    if (!username || !senha) return res.status(400).json({ erro: 'Preencha todos os campos' });

    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ? AND ativo = 1', [username]);
    if (rows.length === 0) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) return res.status(401).json({ erro: 'Usuário ou senha inválidos' });

    req.session.usuario = { id: usuario.id, username: usuario.username, permissao: usuario.permissao };
    res.json({ ok: true, permissao: usuario.permissao });
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ ok: true });
});

router.get('/eu', (req, res) => {
    if (req.session.usuario) return res.json(req.session.usuario);
    res.status(401).json({ erro: 'Não autenticado' });
});

router.post('/criar-admin', async (req, res) => {
    const { username, senha } = req.body;
    if (!username || !senha) return res.status(400).json({ erro: 'Dados incompletos' });
    const hash = await bcrypt.hash(senha, 10);
    await db.query(
        'INSERT INTO usuarios (username, senha_hash, permissao) VALUES (?, ?, "admin") ON DUPLICATE KEY UPDATE senha_hash = ?',
        [username, hash, hash]
    );
    res.json({ ok: true });
});

module.exports = router;