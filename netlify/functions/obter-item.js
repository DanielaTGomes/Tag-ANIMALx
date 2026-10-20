/**
 * Função serverless para obter itens do servidor Omeka S - TAG ANIMALx
 * 
 * 
 * @function obterItens
 */

exports.handler = async function(event, context) {
    try {
        const baseUrl = process.env.API_URL.replace(/\/+$/, '');
        const auth = `key_identity=${process.env.KEY_IDENTITY}&key_credential=${process.env.KEY_CREDENTIAL}`;
        
        // Lê quantos itens a obter (parâmetro per_page) ou define um limite padrão de 50
        const limite = event.queryStringParameters.per_page || 50;
        const url = `${baseUrl}/items?item_set_id=1&per_page=${limite}&${auth}`;

        const resposta = await fetch(url);
        
        if (!resposta.ok) throw new Error(`Erro na API do Omeka: ${resposta.status}`);
        
        const itens = await resposta.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itens)
        };
    } catch (erro) {
        console.error("Erro no guarda-costas (obter-item):", erro);
        return { statusCode: 500, body: JSON.stringify({ erro: erro.message }) };
    }
};