const Api = {
    async post(url, dados) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return res.json();
    },

    async get(url) {
        const res = await fetch(url);
        if (res.status === 401) {
            const atual = window.location.pathname + window.location.search;
            window.location.href = '/login.html?redirect=' + encodeURIComponent(atual);
            return null;
        }
        return res.json();
    },

    async delete(url) {
        const res = await fetch(url, { method: 'DELETE' });
        return res.json();
    },

    async put(url, dados) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        return res.json();
    }
};