const CONSTANTES_FISCAIS = {
    PIS_COFINS: 9.25 / 100,
    TAXA_CLASSICO: 11.5 / 100,
    TAXA_PREMIUM: 16.5 / 100
};

// Função utilitária para mitigar imprecisão de ponto flutuante no JS
const arredondar = (valor) => Math.round(valor * 100) / 100;

function calcularDifalBaseDupla(preco, aliquotaInter, aliquotaInternaSP) {
    if (!preco || preco <= 0) return 0;
    
    const valorIcmsOrigem = preco * aliquotaInter;
    const baseSemIcms = preco - valorIcmsOrigem;
    
    // Forma a Base Dupla inserindo a alíquota de destino por dentro
    const baseDifalDestino = baseSemIcms / (1 - aliquotaInternaSP);
    
    const valorIcmsDestino = baseDifalDestino * aliquotaInternaSP;
    const valorDifal = valorIcmsDestino - valorIcmsOrigem;
    
    return arredondar(valorDifal);
}

function calcularPrecificacao(dados) {
    const custo = Number(dados.custo) || 0;
    const icmsEntPct = (Number(dados.icms_entrada) || 0) / 100;
    const icmsSaiInterPct = (Number(dados.icms_saida_interestadual) || 0) / 100; // Ex: 12%
    const icmsInternoDestinoPct = (Number(dados.aliquota_interna_destino) || 0) / 100; // Ex: 18% para SP
    const ipiPct = (Number(dados.ipi) || 0) / 100;
    const freteML = Number(dados.frete_ml) || 0;
    
    // Regra CODIN: Se ativo, isenta ST.
    const isencaoCodinAtiva = dados.flag_simulacao_st;
    const stPct = isencaoCodinAtiva ? 0.0 : ((Number(dados.st) || 0) / 100);

    const valorIPI = arredondar(custo * ipiPct);
    const valorST = arredondar(custo * stPct);
    
    // O crédito de ICMS de entrada é SEMPRE sobre o custo, independentemente do CODIN
    const valorICMSEnt = arredondar(custo * icmsEntPct);

    // Lucro Real: Base de crédito PIS/COFINS (Custo - ICMS Entrada + IPI)
    const basePisCofinsEnt = custo - valorICMSEnt + valorIPI;
    const creditoPisCofins = arredondar(basePisCofinsEnt * CONSTANTES_FISCAIS.PIS_COFINS);

    const valorLiquido = arredondar(custo - valorICMSEnt - creditoPisCofins + valorIPI + valorST);

    const calcularCenario = (precoVenda, taxaPct) => {
        const preco = Number(precoVenda) || 0;

        const taxaML = arredondar(preco * taxaPct);
        const valorICMSSai = arredondar(preco * icmsSaiInterPct);
        
        // Lucro Real: Tese do Século (Preço - ICMS Saída)
        const basePisCofinsSai = preco - valorICMSSai;
        const debitoPisCofins = arredondar(basePisCofinsSai * CONSTANTES_FISCAIS.PIS_COFINS);
        
        // Cálculo do DIFAL em Base Dupla
        const valorDifal = calcularDifalBaseDupla(preco, icmsSaiInterPct, icmsInternoDestinoPct);

        const custoTotal = arredondar(valorLiquido + freteML + taxaML + debitoPisCofins + valorICMSSai + valorDifal);
        const margem = preco > 0 ? arredondar(((preco - custoTotal) / preco) * 100) : 0;

        return { 
            taxaML, 
            valorICMSSai, 
            debitoPisCofins, 
            valorDifal, 
            custoTotal, 
            margem, 
            valorICMSEnt, 
            valorIPI, 
            valorST, 
            creditoPisCofins, 
            valorLiquido 
        };
    };

    const classico = calcularCenario(dados.preco_classico, CONSTANTES_FISCAIS.TAXA_CLASSICO);
    const premium = calcularCenario(dados.preco_premium, CONSTANTES_FISCAIS.TAXA_PREMIUM);

    return {
        custoBase: {
            valorICMSEnt,
            valorIPI,
            valorST,
            creditoPisCofins,
            valorLiquido
        },
        classico,
        premium
    };
}