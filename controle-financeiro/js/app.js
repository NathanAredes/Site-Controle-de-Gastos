// ==========================================================================
// 1. BANCO DE DADOS TEMPORÁRIO (Memória + LocalStorage)
// ==========================================================================
let listaTransacoes = JSON.parse(localStorage.getItem('minhasFinancasTransacoes')) || [];

// ==========================================================================
// 2. IDENTIFICADOR DE PÁGINAS (Roteamento simples)
// ==========================================================================
// Executa funções diferentes dependendo de qual página está aberta no navegador
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('form-transacao')) {
        // Se encontrar o formulário, estamos na página de LANÇAMENTOS
        inicializarPaginaLancamentos();
    } else if (document.getElementById('graficoCategorias')) {
        // Se encontrar o canvas do gráfico, estamos na página de DASHBOARD
        inicializarPaginaDashboard();
    }
});

// ==========================================================================
// 3. LÓGICA DA PÁGINA DE LANÇAMENTOS (O código que já criamos)
// ==========================================================================
function inicializarPaginaLancamentos() {
    const formTransacao = document.getElementById('form-transacao');
    const tabelaGastosBody = document.querySelector('#tabela-gastos tbody');

    // Desenha a tabela com os dados salvos logo ao abrir a página
    atualizarTabela(tabelaGastosBody);

    formTransacao.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const descricao = document.getElementById('descricao').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const data = document.getElementById('data').value;
        const tipo = document.getElementById('tipo').value;
        const selectCategoria = document.getElementById('categoria');
        const categoriaTexto = selectCategoria.options[selectCategoria.selectedIndex].text;

        const dataFormatada = data.split('-').reverse().join('/');

        const novaTransacao = {
            data: dataFormatada,
            descricao: descricao,
            categoria: categoriaTexto,
            tipo: tipo,
            valor: valor
        };

        listaTransacoes.unshift(novaTransacao);
        localStorage.setItem('minhasFinancasTransacoes', JSON.stringify(listaTransacoes));
        
        atualizarTabela(tabelaGastosBody);
        formTransacao.reset();
    });
}

function atualizarTabela(tabelaBody) {
    tabelaBody.innerHTML = '';

    listaTransacoes.forEach(function(transacao) {
        const linha = document.createElement('tr');
        linha.className = `linha-${transacao.tipo}`;

        const valorFormatado = transacao.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        linha.innerHTML = `
            <td>${transacao.data}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td>${transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1)}</td>
            <td>${valorFormatado}</td>
        `;
        tabelaBody.appendChild(linha);
    });
}

// ==========================================================================
// 4. LÓGICA DA PÁGINA DE DASHBOARD (A Novidade!)
// ==========================================================================
function inicializarPaginaDashboard() {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let totalInvestido = 0;

    // Objeto para agrupar e somar os gastos por categoria (Ex: { Alimentação: 150, Lazer: 40 })
    const gastosPorCategoria = {};

    // Passo A: Passar por cada transação fazendo os cálculos matemáticos
    listaTransacoes.forEach(function(transacao) {
        if (transacao.tipo === 'receita') {
            totalReceitas += transacao.valor;
        } else if (transacao.tipo === 'despesa') {
            totalDespesas += transacao.valor;

            // Se for despesa, agrupa o valor na categoria correspondente para o gráfico
            if (gastosPorCategoria[transacao.categoria]) {
                gastosPorCategoria[transacao.categoria] += transacao.valor;
            } else {
                gastosPorCategoria[transacao.categoria] = transacao.valor;
            }
        } else if (transacao.tipo === 'investimento') {
            totalInvestido += transacao.valor;
        }
    });

    // Passo B: Calcular o Saldo Atual aplicando a nossa regra de negócio [RF-003]
    const saldoAtual = totalReceitas - totalDespesas - totalInvestido;

    // Passo C: Injetar os valores formatados nos cartões HTML da tela
    document.getElementById('total-receitas').innerText = totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('total-despesas').innerText = totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('total-investido').innerText = totalInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('saldo-atual').innerText = saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Passo D: Gerar o Gráfico com o Chart.js [RF-004]
    const categoriasVisuais = Object.keys(gastosPorCategoria); // Pega os nomes (Ex: ["Alimentação", "Lazer"])
    const valoresVisuais = Object.values(gastosPorCategoria);     // Pega os valores (Ex:)

    const ctx = document.getElementById('graficoCategorias').getContext('2d');
    
    // Se não houver despesas cadastradas, exibe um aviso em vez do gráfico vazio
    if (categoriasVisuais.length === 0) {
        document.querySelector('.canvas-container').innerHTML = "<p style='color:#666; padding-top:2rem;'>Nenhuma despesa cadastrada para gerar o gráfico.</p>";
        return;
    }

    new Chart(ctx, {
        type: 'doughnut', // Gráfico estilo Donut (Rosca), fica muito moderno!
        data: {
            labels: categoriasVisuais,
            datasets: [{
                data: valoresVisuais,
                backgroundColor: [
                    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'
                ], // Cores bonitas para cada fatia do gráfico
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
