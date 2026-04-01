function calcularTodos(produtos, stRessarcido) {
    return produtos.map(p => {
        const r = calcularPrecificacao({
            custo: p.custo, icms_entrada: p.icms_entrada, icms_saida: p.icms_saida,
            ipi: p.ipi, difal: p.difal, st: p.st, frete_ml: p.frete_ml,
            preco_classico: p.preco_classico, preco_premium: p.preco_premium,
            flag_simulacao_st: stRessarcido
        });
        return { ...p, classico: r.classico, premium: r.premium };
    });
}