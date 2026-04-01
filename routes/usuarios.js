const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db/conexao');
const { autenticado, apenasAdmin } = require('../middleware/autenticacao');

router.get('/', autenticado, apenasAdmin, async (req, res) => {
    const [rows] = await db.query('SELECT id, username, permissao FROM usuarios ORDER BY id ASC');
    res.json(rows);
});

router.post('/', autenticado, apenasAdmin, async (req, res) => {
    const { username, senha, permissao } = req.body;
    if (!username || !senha) return res.status(400).json({ erro: 'Dados incompletos' });
    const [existe] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
    if (existe.length > 0) return res.status(400).json({ erro: 'Usuário já existe' });
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.query(
        'INSERT INTO usuarios (username, senha_hash, permissao) VALUES (?, ?, ?)',
        [username, hash, permissao || 'visita']
    );
    res.json({ ok: true, id: result.insertId });
});

router.delete('/:id', autenticado, apenasAdmin, async (req, res) => {
    await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
});

module.exports = router;