exports.handler = async function(event, context) {
    try {
        const baseUrl = process.env.API_URL.replace(/\/+$/, '');
        const auth = `key_identity=${process.env.KEY_IDENTITY}&key_credential=${process.env.KEY_CREDENTIAL}`;
        
        // Verifica qual o endpoint que o frontend quer (itens ou propriedades)
        const acao = event.queryStringParameters.acao || 'itens';

        let url = '';
        if (acao === 'propriedades') {
            url = `${baseUrl}/properties?${auth}&per_page=1000`;
        } else {
            url = `${baseUrl}/items?sort_by=modified&sort_order=desc&${auth}`;
        }

        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error(`Erro na API do Omeka: ${resposta.status}`);

        const dados = await resposta.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        };

    } catch (erro) {
        console.error("Erro em carregar-curadoria:", erro);
        return { statusCode: 500, body: JSON.stringify({ erro: erro.message }) };
    }
};