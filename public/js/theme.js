(function () {
    const CHAVE = 'tema';
    const root = document.documentElement;

    function aplicar(tema) {
        root.setAttribute('data-tema', tema);
        localStorage.setItem(CHAVE, tema);
        const btn = document.getElementById('btn-tema');
        if (btn) btn.textContent = tema === 'escuro' ? '☀' : '☾';
    }

    const salvo = localStorage.getItem(CHAVE) || 'escuro';
    aplicar(salvo);

    window.alternarTema = function () {
        const atual = root.getAttribute('data-tema');
        aplicar(atual === 'escuro' ? 'claro' : 'escuro');
    };
})();