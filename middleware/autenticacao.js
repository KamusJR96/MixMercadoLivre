function autenticado(req, res, next) {
    if (req.session && req.session.usuario) return next();
    res.status(401).json({ erro: 'Não autenticado' });
}

function apenasAdmin(req, res, next) {
    if (req.session && req.session.usuario && req.session.usuario.permissao === 'admin') return next();
    res.status(403).json({ erro: 'Sem permissão' });
}

module.exports = { autenticado, apenasAdmin };