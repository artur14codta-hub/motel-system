const quartoSelect = document.getElementById('quartoSelect');
const produtosTableBody = document.getElementById('produtosTableBody');
const consumoTableBody = document.getElementById('consumoTableBody');
const totalConsumo = document.getElementById('totalConsumo');

let quartoSelecionado = null;
let carrinho = [];

// Carregar quartos no select
function carregarQuartos() {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  quartoSelect.innerHTML = '<option value="">Selecione um quarto</option>';
  quartos.forEach((q, index) => {
    quartoSelect.innerHTML += `<option value="${index}">${q.nome} - R$ ${parseFloat(q.valor).toFixed(2)}</option>`;
  });
}
carregarQuartos();

// Carregar produtos cadastrados
function carregarProdutos() {
  let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
  produtosTableBody.innerHTML = '';
  produtos.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${p.nome}</td>
      <td class="border px-4 py-2">${parseFloat(p.preco).toFixed(2)}</td>
      <td class="border px-4 py-2">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded" onclick="adicionarAoCarrinho(${i})">
          Adicionar
        </button>
      </td>
    `;
    produtosTableBody.appendChild(tr);
  });
}
carregarProdutos();

// Seleção do quarto
quartoSelect.addEventListener('change', () => {
  const index = quartoSelect.value;
  if (index === "") {
    carrinho = [];
    atualizarTabela();
    return;
  }
  quartoSelecionado = parseInt(index);

  // Carregar carrinho do quarto se existir
  let consumos = JSON.parse(localStorage.getItem('consumos')) || {};
  carrinho = consumos[quartoSelecionado] || [];
  atualizarTabela();
});

// Adicionar item ao carrinho pelo botão de produtos
function adicionarAoCarrinho(produtoIndex) {
  if (quartoSelecionado === null) {
    alert("Selecione um quarto primeiro!");
    return;
  }
  const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
  const produto = produtos[produtoIndex];

  if (!produto) return;

  carrinho.push({ nome: produto.nome, valor: parseFloat(produto.preco) });
  salvarCarrinho();
  atualizarTabela();
}

// Atualizar tabela de consumo
function atualizarTabela() {
  consumoTableBody.innerHTML = '';
  let total = 0;
  carrinho.forEach((item, i) => {
    total += item.valor;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${item.nome}</td>
      <td class="border px-4 py-2">${item.valor.toFixed(2)}</td>
      <td class="border px-4 py-2">
        <button class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" onclick="removerItem(${i})">Remover</button>
      </td>
    `;
    consumoTableBody.appendChild(tr);
  });
  totalConsumo.innerText = total.toFixed(2);
}

// Remover item do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarTabela();
}

// Salvar carrinho no LocalStorage
function salvarCarrinho() {
  let consumos = JSON.parse(localStorage.getItem('consumos')) || {};
  consumos[quartoSelecionado] = carrinho;
  localStorage.setItem('consumos', JSON.stringify(consumos));
}

// Botão ir para pagamento
document.getElementById('irPagamentoBtn').addEventListener('click', () => {
  if (quartoSelecionado === null) {
    alert("Selecione um quarto antes de prosseguir para o pagamento!");
    return;
  }
  localStorage.setItem('quartoSelecionado', quartoSelecionado);
  window.location.href = "pagamento.html";
});
