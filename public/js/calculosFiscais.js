const CONSTANTES_FISCAIS = {
    PIS_COFINS: 9.25 / 100,
    TAXA_CLASSICO: 11.5 / 100,
    TAXA_PREMIUM: 16.5 / 100
};

function calcularPrecificacao(dados) {
    const custo = Number(dados.custo) || 0;
    const icmsEntPct = (Number(dados.icms_entrada) || 0) / 100;
    const icmsSaiPct = (Number(dados.icms_saida) || 0) / 100;
    const ipiPct = (Number(dados.ipi) || 0) / 100;
    const difalPct = (Number(dados.difal) || 0) / 100;
    const freteML = Number(dados.frete_ml) || 0;
    const stPct = dados.flag_simulacao_st ? 0.0 : ((Number(dados.st) || 0) / 100);
    const codin = dados.flag_simulacao_st;

    const valorIPI = custo * ipiPct;
    const valorST = custo * stPct;

    const calcularCenario = (precoVenda, taxaPct) => {
        const preco = Number(precoVenda) || 0;

        const valorICMSEnt = codin ? preco * icmsEntPct : custo * icmsEntPct;

        const basePisCofinsEnt = custo - valorICMSEnt + valorIPI;
        const creditoPisCofins = basePisCofinsEnt * CONSTANTES_FISCAIS.PIS_COFINS;

        const valorLiquido = custo - valorICMSEnt - creditoPisCofins + valorIPI + valorST;

        const taxaML = preco * taxaPct;
        const valorICMSSai = preco * icmsSaiPct;
        const basePisCofinsSai = preco - valorICMSSai;
        const debitoPisCofins = basePisCofinsSai * CONSTANTES_FISCAIS.PIS_COFINS;
        const valorDifal = preco * difalPct;

        const custoTotal = valorLiquido + freteML + taxaML + debitoPisCofins + valorICMSSai + valorDifal;
        const margem = preco > 0 ? ((preco - custoTotal) / preco) * 100 : 0;

        return { taxaML, valorICMSSai, debitoPisCofins, valorDifal, custoTotal, margem, valorICMSEnt, valorIPI, valorST, creditoPisCofins, valorLiquido };
    };

    const classico = calcularCenario(dados.preco_classico, CONSTANTES_FISCAIS.TAXA_CLASSICO);
    const premium = calcularCenario(dados.preco_premium, CONSTANTES_FISCAIS.TAXA_PREMIUM);

    return {
        custoBase: {
            valorICMSEnt: classico.valorICMSEnt,
            valorIPI: classico.valorIPI,
            valorST: classico.valorST,
            creditoPisCofins: classico.creditoPisCofins,
            valorLiquido: classico.valorLiquido
        },
        classico,
        premium
    };
}