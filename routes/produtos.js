const express = require('express');
const router = express.Router();
const db = require('../db/conexao');
const { autenticado, apenasAdmin } = require('../middleware/autenticacao');

router.get('/', autenticado, async (req, res) => {
    const [rows] = await db.query(`
        SELECT p.*, m.nome AS marca_nome
        FROM produtos p
        LEFT JOIN marcas m ON p.marca_id = m.id
        ORDER BY p.criado_em DESC
    `);
    res.json(rows);
});

router.get('/:id', autenticado, async (req, res) => {
    const [rows] = await db.query(`
        SELECT p.*, m.nome AS marca_nome
        FROM produtos p
        LEFT JOIN marcas m ON p.marca_id = m.id
        WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
});

router.post('/', autenticado, apenasAdmin, async (req, res) => {
    const d = req.body;
    const [result] = await db.query(`
        INSERT INTO produtos
        (sku, cod_barras, marca_id, nome, custo, icms_entrada, st, ipi, difal, icms_saida,
         frete_ml, preco_classico, preco_premium, preco_concorrente_classico, preco_concorrente_premium)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
        d.sku || null, d.cod_barras || null, d.marca_id || null, d.nome,
        d.custo || 0, d.icms_entrada || 0, d.st || 0, d.ipi || 0,
        d.difal || 0, d.icms_saida || 0, d.frete_ml || 0,
        d.preco_classico || 0, d.preco_premium || 0,
        d.preco_concorrente_classico || 0, d.preco_concorrente_premium || 0
    ]);
    res.json({ ok: true, id: result.insertId });
});

router.put('/:id', autenticado, apenasAdmin, async (req, res) => {
    const d = req.body;
    await db.query(`
        UPDATE produtos SET
        sku=?, cod_barras=?, marca_id=?, nome=?, custo=?, icms_entrada=?, st=?, ipi=?,
        difal=?, icms_saida=?, frete_ml=?, preco_classico=?, preco_premium=?,
        preco_concorrente_classico=?, preco_concorrente_premium=?
        WHERE id=?
    `, [
        d.sku || null, d.cod_barras || null, d.marca_id || null, d.nome,
        d.custo || 0, d.icms_entrada || 0, d.st || 0, d.ipi || 0,
        d.difal || 0, d.icms_saida || 0, d.frete_ml || 0,
        d.preco_classico || 0, d.preco_premium || 0,
        d.preco_concorrente_classico || 0, d.preco_concorrente_premium || 0,
        req.params.id
    ]);
    res.json({ ok: true });
});

router.delete('/:id', autenticado, apenasAdmin, async (req, res) => {
    await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
});

module.exports = router;