const CONSTANTES_FISCAIS = {
    PIS_COFINS: 9.25 / 100,
    TAXA_CLASSICO: 11.5 / 100,
    TAXA_PREMIUM: 16.5 / 100
};

// Função utilitária para mitigar imprecisão de ponto flutuante
const arredondar = (valor) => Math.round(valor * 100) / 100;

function calcularDifalBaseDupla(preco, aliquotaInter, aliquotaInternaDestino) {
    if (!preco || preco <= 0) return 0;
    
    const valorIcmsOrigem = preco * aliquotaInter;
    const baseSemIcms = preco - valorIcmsOrigem;
    const baseDifalDestino = baseSemIcms / (1 - aliquotaInternaDestino);
    const valorIcmsDestino = baseDifalDestino * aliquotaInternaDestino;
    
    return arredondar(valorIcmsDestino - valorIcmsOrigem);
}

function calcularPrecificacao(dados) {
    const custo = Number(dados.custo) || 0;
    const icmsEntPct = (Number(dados.icms_entrada) || 0) / 100;
    const icmsSaiInterPct = (Number(dados.icms_saida) || 0) / 100; 
    const difalTelaPct = (Number(dados.difal) || 0) / 100; 
    
    // Deduz a alíquota interna somando a saída + difal tela
    const icmsInternoDestinoPct = icmsSaiInterPct + difalTelaPct;
    
    const ipiPct = (Number(dados.ipi) || 0) / 100;
    const freteML = Number(dados.frete_ml) || 0;
    
    // Regra CODIN: Isenção de ST
    const isencaoCodinAtiva = dados.flag_simulacao_st;
    const stPct = isencaoCodinAtiva ? 0.0 : ((Number(dados.st) || 0) / 100);

    const valorIPI = arredondar(custo * ipiPct);
    const valorST = arredondar(custo * stPct);
    const valorICMSEnt = arredondar(custo * icmsEntPct);

    // Lucro Real: Base de crédito PIS/COFINS
    const basePisCofinsEnt = custo - valorICMSEnt + valorIPI;
    const creditoPisCofins = arredondar(basePisCofinsEnt * CONSTANTES_FISCAIS.PIS_COFINS);

    const valorLiquido = arredondar(custo - valorICMSEnt - creditoPisCofins + valorIPI + valorST);

    const calcularCenario = (precoVenda, taxaPct) => {
        const preco = Number(precoVenda) || 0;

        const taxaML = arredondar(preco * taxaPct);
        const valorICMSSai = arredondar(preco * icmsSaiInterPct);
        
        // Benefício CODIN: 6% de Crédito Presumido na saída (reduz o custo final)
        const creditoPresumidoCodin = isencaoCodinAtiva ? arredondar(preco * 0.06) : 0;
        
        // Lucro Real: Tese do Século
        const basePisCofinsSai = preco - valorICMSSai;
        const debitoPisCofins = arredondar(basePisCofinsSai * CONSTANTES_FISCAIS.PIS_COFINS);
        
        // DIFAL Base Dupla
        const valorDifal = calcularDifalBaseDupla(preco, icmsSaiInterPct, icmsInternoDestinoPct);

        // Custo Total abatendo o Crédito Presumido do CODIN
        const custoTotal = arredondar(valorLiquido + freteML + taxaML + debitoPisCofins + valorICMSSai + valorDifal - creditoPresumidoCodin);
        const margem = preco > 0 ? arredondar(((preco - custoTotal) / preco) * 100) : 0;

        return { 
            taxaML, valorICMSSai, debitoPisCofins, valorDifal, creditoPresumidoCodin,
            custoTotal, margem, valorICMSEnt, valorIPI, valorST, creditoPisCofins, valorLiquido 
        };
    };

    const classico = calcularCenario(dados.preco_classico, CONSTANTES_FISCAIS.TAXA_CLASSICO);
    const premium = calcularCenario(dados.preco_premium, CONSTANTES_FISCAIS.TAXA_PREMIUM);

    return {
        custoBase: { valorICMSEnt, valorIPI, valorST, creditoPisCofins, valorLiquido },
        classico, premium
    };
}