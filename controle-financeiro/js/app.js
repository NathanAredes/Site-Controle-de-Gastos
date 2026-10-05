// ==========================================================================
// 1. CAPTURA DOS ELEMENTOS DA TELA (DOM)
// ==========================================================================
// Pegamos o formulário e a tabela do HTML para o JavaScript conseguir mexer neles
const formTransacao = document.getElementById('form-transacao');
const tabelaGastosBody = document.querySelector('#tabela-gastos tbody');

// ==========================================================================
// 2. BANCO DE DADOS TEMPORÁRIO (Memória do Navegador)
// ==========================================================================
// Como ainda não conectamos o banco em nuvem, criamos uma lista (Array) na memória
let listaTransacoes = [];

// ==========================================================================
// 3. FUNÇÃO PARA ADICIONAR UMA NOVA TRANSAÇÃO
// ==========================================================================
formTransacao.addEventListener('submit', function(evento) {
    // Evita que a página recarregue ao enviar o formulário (comportamento padrão do HTML)
    evento.preventDefault();

    // Captura os valores que você digitou nos campos
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    
    // Captura o texto da categoria selecionada (Alimentação, Lazer, etc.)
    const selectCategoria = document.getElementById('categoria');
    const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex].text;

    // Formata a data de YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY
    const dataFormatada = data.split('-').reverse().join('/');

    // Cria um objeto representando a nova transação
    const novaTransacao = {
        data: dataFormatada,
        descricao: descricao,
        categoria: categoriaTexto,
        tipo: tipo,
        valor: valor
    };

    // Adiciona o novo gasto no início da nossa lista (atendendo ao requisito de mais recentes no topo)
    listaTransacoes.unshift(novaTransacao);

    // Atualiza a tabela na tela
    atualizarTabela();

    // Limpa os campos do formulário para você digitar o próximo gasto
    formTransacao.reset();
});

// ==========================================================================
// 4. FUNÇÃO QUE DESENHA A TABELA NA TELA
// ==========================================================================
function atualizarTabela() {
    // Limpa todo o conteúdo atual da tabela para não duplicar os dados
    tabelaGastosBody.innerHTML = '';

    // Passa por cada transação da nossa lista e cria uma linha (tr) no HTML
    listaTransacoes.forEach(function(transacao) {
        const linha = document.createElement('tr');
        
        // Aplica a classe CSS correta baseada no tipo (linha-despesa, linha-receita, linha-investimento)
        linha.className = `linha-${transacao.tipo}`;

        // Formata o valor para a moeda brasileira (R\$)
        const valorFormatado = transacao.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // Monta as colunas (td) da linha
        linha.innerHTML = `
            <td>${transacao.data}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td>${transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1)}</td>
            <td>${valorFormatado}</td>
        `;

        // Coloca a nova linha dentro do corpo da tabela
        tabelaGastosBody.appendChild(linha);
    });
}
