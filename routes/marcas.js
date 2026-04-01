const express = require('express');
const router = express.Router();
const db = require('../db/conexao');
const { autenticado, apenasAdmin } = require('../middleware/autenticacao');

router.get('/', autenticado, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM marcas ORDER BY nome ASC');
    res.json(rows);
});

router.post('/', autenticado, apenasAdmin, async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
    const [result] = await db.query('INSERT INTO marcas (nome) VALUES (?)', [nome.trim()]);
    res.json({ ok: true, id: result.insertId });
});

router.delete('/:id', autenticado, apenasAdmin, async (req, res) => {
    await db.query('DELETE FROM marcas WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
});

module.exports = router;